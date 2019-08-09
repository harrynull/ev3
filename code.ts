let rotating_speed = 10
let moving_speed = 20 //80
let ADJUST_CONSTANT = 3
let moving_back = false
let moving = true
let automatic_mode = false
let target_gyro = 0
let gyro_diff = 0
let BothTouchSensorsPressed = () => sensors.touch1.isPressed() && sensors.touch2.isPressed();
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(10, .5, MoveUnit.Rotations)
})
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(-10, .5, MoveUnit.Rotations)
})
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    automatic_mode = false
    target_gyro = sensors.gyro4.angle()
    motors.largeAD.steer(moving_speed, moving_speed, .5, MoveUnit.Rotations)
})
brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    //automatic_mode = true
    //target_gyro += 90
    Mission10PipeReplacement()
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
        motors.largeAD.steer(-gyro_diff, (moving_back ? -1 : 1) * (moving ? moving_speed : rotating_speed))
    } else {
        motors.largeAD.stop()
    }
    loops.pause(100)
})


function Mission10PipeReplacement() {
    moving = false
    target_gyro += 90 // turn left
    brick.showString("S: M10_1_AWAIT_TURNING", 1)
    pauseUntil(() => Math.abs(gyro_diff) < 5)

    moving = true
    moving_back = true
    brick.showString("S: M10_2_BACK_WALL", 1)
    pauseUntil(BothTouchSensorsPressed)
    target_gyro = sensors.gyro4.angle()

    moving_back = false
    brick.showString("S: M10_3_GO_FORWARD", 1)
    motors.largeAD.steer(20, 20, 1.5, MoveUnit.Rotations)
    motors.largeAD.pauseUntilReady()
    motors.mediumB.run(20, 3.5, MoveUnit.Rotations)
    motors.mediumB.pauseUntilReady()
    motors.largeAD.steer(20, 20, 0.75, MoveUnit.Rotations)
    motors.largeAD.pauseUntilReady()
    loops.pause(5000)

    moving = false
    brick.showString("S: M10_4_FINISHED", 1)
    //1.8 rot/ A 3 rot /0.8 rot
    //1.5 rot / A 3.5 rot / 0.75 rot 
}

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
pause(2000)
let last_bright_detected_time = 0
let dark_detected_after_bright = false
sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Bright, function () {
    if (dark_detected_after_bright)
        Mission10PipeReplacement()
    else {
        last_bright_detected_time = control.timer1.seconds()
        dark_detected_after_bright = false
    }
})
sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Dark, function () {
    if (control.timer1.seconds() - last_bright_detected_time > 1) return
    dark_detected_after_bright = true
})

