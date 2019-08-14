// Initialization
let rotating_speed = 40
let moving_speed = 20 //80
let moving_back = false
let moving = true
let target_gyro = 0
let automatic_mode = false // if true, the robot will move according to the above variables
let gyro_diff = 0 // the difference between current gyro reading and the target gyro
let BothTouchSensorsPressed = () => sensors.touch1.isPressed() && sensors.touch2.isPressed();
function pauseUntilTurned() {
    moving = false
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    pauseUntil(() => Math.abs(gyro_diff) < 1)
    moving = true
}
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {

})
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {

})
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    automatic_mode = true
    moving = true
    target_gyro = sensors.gyro4.angle()
    moving_speed = 50
    rotating_speed = 40
    pause(2000)
    target_gyro += 90
    pauseUntilTurned()
    pause(1000)
    target_gyro += 90
    pauseUntilTurned()
    pause(1000)
    target_gyro += 90
    pauseUntilTurned()
    pause(1000)
    target_gyro -= 180
    pauseUntilTurned()
    automatic_mode = false
    return;
    automatic_mode = false
    target_gyro = sensors.gyro4.angle()
    motors.largeAD.steer(moving_speed, moving_speed, 5, MoveUnit.Rotations)
})

brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    //motors.largeAD.steer(-100, 30)
    automatic_mode = true
    moving = true
    target_gyro = sensors.gyro4.angle()
    moving_speed = 50
    pause(2000)
    target_gyro += 90 // left

    /*
    moving = false
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    pauseUntil(() => Math.abs(gyro_diff) < 1)
*/

    moving = true

    pause(3000)
    moving_back = true
    pause(3000)
    target_gyro -= 20
    pause(5000)
    target_gyro += 30
    pause(2000)
    moving = false
    /*moving_speed = 50
    pause(3000)
    target_gyro += 90
    pause(3000)
    target_gyro -= 180
*/
})

// "automatic mode" - control the movement of the robot
forever(function () {
    // automatic mode code navigate through gyro sensor
    // will move towards "target_gyro"
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    brick.showString("now:    " + sensors.gyro4.angle(), 4)
    brick.showString("target: " + target_gyro, 5)
    brick.showString("right:  " + parseInt("" + motors.largeA.speed() * 10) / 10, 7)
    brick.showString("left:   " + parseInt("" + motors.largeD.speed() * 10) / 10, 8)

    brick.showString("moving: " + moving, 9)
    brick.showString("back:   " + moving_back, 10)
    brick.showString("auto:   " + automatic_mode, 11)

    if (automatic_mode) {
        // if the "moving" is "true" or the robot needs to be turned (gyro_diff != 0)
        // that is, when the motor AD needs to be running
        if (moving) {
            motors.largeAD.steer((moving_back ? -1 : 1) * (-gyro_diff),
                (moving_back ? -1 : 1) * (moving ? moving_speed : rotating_speed))
        } else if (gyro_diff != 0) { // turning mode
            let power = Math.min(Math.max(Math.abs(gyro_diff), 10), 100)
            if (gyro_diff > 0) {
                motors.largeA.run(0)
                motors.largeD.run(power)
            }
            else {
                motors.largeA.run(power)
                motors.largeD.run(0)
            }
        } else {
            motors.largeAD.stop()
        }
    }
    //motors.largeAD.steer((sensors.color3.reflectedLight() - 50)/10, 20)
    //loops.pause(100)
})

function Mission10PipeReplacement() {
    // go back a little to get back to the line
    moving_back = true
    pause(700)
    moving_back = false

    moving = false // avoid moving while it is turning
    target_gyro += 90 // turn left to face the pipe
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    brick.showString("S: M10_1_AWAIT_TURNING", 1)
    pauseUntil(() => Math.abs(gyro_diff) < 3)

    // the robot should be facing towards the pipe now
    moving = true
    pause(1000)  // move forward for 1s to hook the pipe

    moving_back = true // move backward until it hits the wall
    brick.showString("S: M10_2_BACK_WALL", 1)
    pauseUntil(BothTouchSensorsPressed)
    //target_gyro = sensors.gyro4.angle()

    moving_back = false
    brick.showString("S: M10_3_GO_FORWARD", 1)

    moving_speed = 50
    pause(1550)
    // hopefully the robot is in position.

    automatic_mode = false
    motors.largeAD.steer(50, 30, 150, MoveUnit.Degrees)
    motors.largeAD.pauseUntilReady()
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
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
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
brick.buttonEnter.pauseUntil(ButtonEvent.Pressed)

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
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Bright)
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Dark)
Mission10PipeReplacement()
MissionM06ToiletLever()
