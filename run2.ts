// Initialization
let moving_speed = 20
let moving_back = false
let moving = true
let target_gyro = 0
let automatic_mode = false // if true, the robot will move according to the above variables
let gyro_diff = 0 // the difference between current gyro reading and the target gyro
let BothTouchSensorsPressed = () => sensors.touch1.isPressed() && sensors.touch2.isPressed();

// Pause the program until the gyro sensor confirms that the robot
// has turned completely (within 1 deg)
// Note: This will turn on turning mode (by setting `moving` to false)
// Postcondition: abs(gyro_diff) < 1, moving = true
function pauseUntilTurned() {
    moving = false
    // calculate gyro_diff here to avoid data race
    // because you don't know if the assignment in the forever function
    // will be executed before the "pauseUntil" here 
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    pauseUntil(() => Math.abs(gyro_diff) < 1)
    moving = true
}
brick.buttonLeft.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(50, 360, MoveUnit.Degrees)
})
brick.buttonRight.onEvent(ButtonEvent.Pressed, function () {
    motors.mediumB.run(50, 360, MoveUnit.Degrees)
})
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    automatic_mode = false
    target_gyro = sensors.gyro4.angle()
})

brick.buttonUp.onEvent(ButtonEvent.Pressed, function () {
    
})

/* "automatic mode" - control the movement of the robot
 * It will navigate through the gyro sensor
 * and will move the robot facing "target_gyro"
 * [Parameters] this is controlled by the following variables
 * automatic_mode - whether automatic mode is in effect.
 * moving         - whether the robot should be moving.
 * moving_speed   - the speed of the robot when it is moving.
 * moving_back    - false: move forward, true: move backward.
 * target_gyro    - the target orientation.
 * [Side effects] the following variables will be set in the loop
 * gyro_diff      - the difference between the current gyro reading and the target gyro
 *                  will be set regardless of `automatic_mode`
 * [Notes]
 * Set `moving` to false if you need to turn a large angle. This will enable
 * turning mode. Use the function `pauseUntilTurned` to pause until the robot
 * is fully turned.
 */
forever(function () {
    // update gyro_diff
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360

    // debugging stuff
    brick.showString("now:    " + sensors.gyro4.angle(), 4)
    brick.showString("target: " + target_gyro, 5)
    brick.showString("right:  " + parseInt("" + motors.largeA.speed() * 10) / 10, 7)
    brick.showString("left:   " + parseInt("" + motors.largeD.speed() * 10) / 10, 8)
    brick.showString("moving: " + moving, 9)
    brick.showString("back:   " + moving_back, 10)
    brick.showString("auto:   " + automatic_mode, 11)

    if (automatic_mode) {
        if (moving) { // normal moving mode
            motors.largeAD.steer((moving_back ? -1 : 1) * (-gyro_diff),
                (moving_back ? -1 : 1) * moving_speed)
        } else if (gyro_diff != 0) { // turning mode
            // Use the abs value and limit the power between 10 and 100.
            let power = Math.clamp(10, 100, Math.abs(gyro_diff))
            // Only use one of the motor for turning
            // Do NOT use "tank" or "steer" here. For some reason they cause the motor
            // to move inconsistently.
            if (gyro_diff > 0) {
                motors.largeA.run(0)
                motors.largeD.run(power)
            }
            else {
                motors.largeA.run(power)
                motors.largeD.run(0)
            }
        } else { // `moving` is false and the robot does not need to be turned
            motors.largeAD.stop()
        }
    }
    //motors.largeAD.steer((sensors.color3.reflectedLight() - 50)/10, 20)
})

// Press enter to start the procedure
brick.buttonEnter.pauseUntil(ButtonEvent.Pressed)
automatic_mode = true
target_gyro = sensors.gyro4.angle()
brick.showString("S: RUN 2", 1)
