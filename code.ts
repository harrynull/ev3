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

// Lower the arm when button left is pressed
brick.buttonLeft.onEvent(ButtonEvent.Bumped, function () {
    motors.mediumB.run(50, 370, MoveUnit.Degrees)
})
// Lift the arm when button right is pressed
brick.buttonRight.onEvent(ButtonEvent.Bumped, function () {
    motors.mediumB.run(-50, 370, MoveUnit.Degrees)
})

// Start Run 3 when button down is pressed
brick.buttonDown.onEvent(ButtonEvent.Bumped, function () {
    automatic_mode = true
    target_gyro = sensors.gyro4.angle()

    Mission09Tripod()
    Mission18Faucet()
})

// Start Run 2 when button up is pressed
brick.buttonUp.onEvent(ButtonEvent.Bumped, function () {
    automatic_mode = true
    moving = true
    target_gyro = sensors.gyro4.angle()
    moving_speed = 50

    // move forward
    pause(2100)
    // turn left for Mission Filter
    target_gyro += 90
    pauseUntilTurned()
    // move forward to close the latch
    pause(1000)
    // move back for 1s
    moving_back = true
    pause(1000)
    moving_back = false
    // turn left 30 deg and go forward
    target_gyro += 30
    pauseUntilTurned()
    pause(1500)
    // turn right 30 deg, should be facing the pump
    target_gyro -= 30
    pauseUntilTurned()
    // go hit the pump
    pause(2200)
    // go back
    moving_back = true
    pause(500)
    moving_back = false
    // turn right for rain
    target_gyro -= 90
    pauseUntilTurned()
    moving = false
    motors.largeAD.stop()
    motors.mediumB.run(50, 370 * 3, MoveUnit.Degrees) // lower the arm
    motors.mediumB.pauseUntilReady()
    pause(1500)
    //move back to hit the wall
    moving = true
    moving_back = true
    pauseUntil(BothTouchSensorsPressed)
    moving_back = false
    // move under the rain
    moving_speed = 20
    pause(2000)
    moving = false

    motors.mediumB.run(-50, 390, MoveUnit.Degrees) // lift the arm
    motors.mediumB.pauseUntilReady()
    automatic_mode = false
    motors.largeA.run(50, 80, MoveUnit.Degrees)
    pause(1500)
    motors.largeA.run(-50, 80, MoveUnit.Degrees)
    pause(1500)
    motors.largeAD.steer(0, -50, 500, MoveUnit.Degrees)
    // go back for the pump
    automatic_mode = true
    moving_speed = 50
    // turn right
    target_gyro = -30
    pauseUntilTurned()
    moving_back = true
    pause(3000)
    moving_back = false
    // turn right to go back to base
    target_gyro -= 95
    pauseUntilTurned()
    pause(3500)
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
 * 
 * Ideally should have used a class for better encapsulation.
 * But apparently blocks don't support it.
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
function Mission09Tripod() {
    moving_speed = 50
    moving = true
    pause(3500)
    //moving = false

    sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Bright)
    sensors.color3.pauseUntilLightDetected(LightIntensityMode.Reflected, Light.Dark)

    target_gyro -= 185
    pauseUntilTurned()
    moving_speed = 50
    pause(6000)
    moving = false
    //moving_speed = 20
}

function Mission18Faucet() {
    moving_back = true
    pause(500)
    moving_back = false

    target_gyro += 40
    pauseUntilTurned()
    moving = true
    pause(3500)
    moving_speed += 10
    pause(500)
    moving = false
    moving_speed = 20
}

function Mission2Fountain() {
    moving_speed = 30
    moving = true

    pause(3750) //move straight to the mission point
    target_gyro -= 90 //turn left 90 degree
    pauseUntilTurned()
    moving_back = true //move backward for 0.68s
    pause(680)
    moving_back = false //stop moving back
}

