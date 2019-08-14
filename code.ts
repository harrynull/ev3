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
    automatic_mode = true
    moving = true
    target_gyro = sensors.gyro4.angle()
    moving_speed = 50
    pause(2000)
    target_gyro += 90 // left
    pauseUntilTurned()
    moving_back = true
    pause(3000)
    target_gyro -= 20
    pause(5000)
    target_gyro += 30
    pause(2000)
    moving = false
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

function Mission10PipeReplacement() {
    // Go back a little to get back to the line
    moving_back = true
    pause(700)
    moving_back = false

    // Turn left to face the pipe
    target_gyro += 90 
    pauseUntilTurned()

    // The robot should be facing towards the pipe now
    // Move forward for 1s to hook the pipe
    moving = true
    pause(1000)  

    // Move backward until it hits the wall
    moving_back = true 
    pauseUntil(BothTouchSensorsPressed)
    moving_back = false
    //target_gyro = sensors.gyro4.angle()

    // Move forward for putting the new pipe
    // Hopefully the robot will be in position.
    moving_speed = 50
    pause(1550)

    // Disengage the automatic mode. Put down the new pipe.
    automatic_mode = false
    motors.largeAD.steer(50, 30, 150, MoveUnit.Degrees)
    motors.largeAD.pauseUntilReady()
    motors.mediumB.run(50, 1200, MoveUnit.Degrees) // lower
    motors.mediumB.pauseUntilReady()

    // Engage the automatic mode and move back.
    automatic_mode = true
    moving_back = true
    loops.pause(1000)
    moving_back = false

    // Turn right and move forward for the next mission.
    target_gyro -= 90
    pauseUntilTurned()
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
automatic_mode = true
target_gyro = sensors.gyro4.angle()
brick.showString("S: RUN 1", 1)
// the approximate time it takes to the first mission (M10)
// use the pause to avoid mistaking dark/bright spots of the map as M10 starting line
//pause(2000)
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Bright)
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Dark)
Mission10PipeReplacement()
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Bright)
sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Dark)
MissionM06ToiletLever()
