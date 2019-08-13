// Initialization
let rotating_speed = 40
let moving_speed = 20 //80
let ADJUST_CONSTANT = 3
let moving_back = false
let moving = true
let automatic_mode = false
let target_gyro = 0
let gyro_diff = 0
let BothTouchSensorsPressed = () => sensors.touch1.isPressed() && sensors.touch2.isPressed();
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(50, 1, MoveUnit.Rotations)
})
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(-50, 1, MoveUnit.Rotations)
})
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    automatic_mode = false
    target_gyro = sensors.gyro4.angle()
    motors.largeAD.steer(moving_speed, moving_speed, 5, MoveUnit.Rotations)
})
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    //automatic_mode = true
    //target_gyro += 90
    //Mission10PipeReplacement()

    motors.largeAD.steer(-100, 30)

    // Go back
    //motors.largeAD.steer(9, 21, -200, MoveUnit.Degrees)
    //motors.largeAD.pauseUntilReady()
})

forever(function () {
    // automatic mode code navigate through gyro sensor
    // will move towards "target_gyro"
    gyro_diff = ((sensors.gyro4.angle() - target_gyro) % 360) * ADJUST_CONSTANT
    brick.showString("now:    " + sensors.gyro4.angle(), 4)
    brick.showString("target: " + target_gyro, 5)
    brick.showString("left:   " + parseInt("" + motors.largeA.speed() * 10) / 10, 7)
    brick.showString("right:  " + parseInt("" + motors.largeD.speed() * 10) / 10, 8)

    brick.showString("moving: " + moving, 9)
    brick.showString("back:   " + moving_back, 10)
    brick.showString("auto:   " + automatic_mode, 11)

    if (!automatic_mode) {
        return;
    }
    if (moving || gyro_diff != 0) {
        motors.largeAD.steer((moving_back ? -1 : 1) * (-gyro_diff),
            (moving_back ? -1 : 1) * (moving ? moving_speed : rotating_speed))
    } else {
        motors.largeAD.stop()
    }
    loops.pause(100)
})


function Mission10PipeReplacement() {
    // go back a little to get back to the line
    moving_back = true
    pause(700)
    moving_back = false

    moving = false // avoid moving while it is turning
    target_gyro += 90 // turn left to face the pipe
    gyro_diff = ((sensors.gyro4.angle() - target_gyro) % 360) * ADJUST_CONSTANT
    brick.showString("S: M10_1_AWAIT_TURNING", 1)
    pauseUntil(() => Math.abs(gyro_diff) < 5)

    moving = true
    pause(1000)
    moving_back = true
    brick.showString("S: M10_2_BACK_WALL", 1)
    pauseUntil(BothTouchSensorsPressed)
    target_gyro = sensors.gyro4.angle()

    moving_back = false
    brick.showString("S: M10_3_GO_FORWARD", 1)

    moving = true
    moving_speed = 50
    pause(1550)

    automatic_mode = false
    motors.largeAD.steer(50, 30, 150, MoveUnit.Degrees)
    motors.largeAD.pauseUntilReady()

    /*pause(2000)
    moving_back = true

    pause(1500)
    moving_back = false

    automatic_mode = false

    motors.largeAD.steer(50, 30, 100, MoveUnit.Degrees)
    motors.largeAD.pauseUntilReady()
    motors.largeAD.steer(9, 21, 200, MoveUnit.Degrees)
    motors.largeAD.pauseUntilReady()
    */
    motors.mediumB.run(50, 1200, MoveUnit.Degrees) // lower
    motors.mediumB.pauseUntilReady()

    brick.showString("S: M10_4_FINISHED", 1)

    automatic_mode = true
    moving_back = true
    loops.pause(1000)
    moving_back = false
    target_gyro -= 90 // turn right

    brick.showString("S: M10_5_RESETED", 1)
}

function MissionM06ToiletLever() {
    brick.showString("S: M06_1_START", 1)
    moving_back = false
    pause(2000)

    brick.showString("S: M06_2_TURNING", 1)
    moving = false
    target_gyro += 90 // turn left
    gyro_diff = ((sensors.gyro4.angle() - target_gyro) % 360) * ADJUST_CONSTANT
    pauseUntil(() => Math.abs(gyro_diff) < 5)

    brick.showString("S: M06_3_PRESS", 1)
    motors.mediumB.run(50, 1270, MoveUnit.Degrees) // lowering
    motors.mediumB.pauseUntilReady()
    motors.mediumB.run(-50, 1270, MoveUnit.Degrees) // lifting
    motors.mediumB.pauseUntilReady()

    brick.showString("S: M06_4_TURNING", 1)
    target_gyro -= 90 // right left
    moving = true
}

// Press enter to start the procedure
pauseUntil(() => brick.buttonEnter.isPressed())

// move back to hit the wall to calibrate the gyro sensor and position
automatic_mode = true
target_gyro = sensors.gyro4.angle()
moving_back = true;
brick.showString("S: INIT_MVBACK", 1)

//pauseUntil(BothTouchSensorsPressed)
target_gyro = sensors.gyro4.angle()
moving_back = false
brick.showString("S: GYRO RESETED. RUN 1", 1)
// the approximate time it takes to the first mission (M10)
// use the pause to avoid mistaking dark/bright spots of the map as M10 starting line
//pause(2000)
let last_bright_detected_time = 0
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Bright)
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Dark)
Mission10PipeReplacement()
MissionM06ToiletLever()
/*
//sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Bright, function () {
//    last_bright_detected_time = control.timer1.seconds()
//})
sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Dark, function () {
    if (control.timer1.seconds() - last_bright_detected_time < 1) {
        Mission10PipeReplacement()
        MissionM06ToiletLever()
    }
})*/