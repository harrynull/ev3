// Initialization
let moving_speed = 20
let moving_back = false
let moving = true
let target_gyro = 0
let automatic_mode = false // if true, the robot will move according to the above variables
let gyro_diff = 0 // the difference between current gyro reading and the target gyro

// Pause the program until the gyro sensor confirms that the robot
// has turned completely (within 1 deg)
// Optional parameter: ang: the angle in which it is turned. + means left
// Note: This will turn on turning mode (by setting `moving` to false)
// Postcondition: abs(gyro_diff) < 1, moving = true
function turnAndWait(ang?: number) {
    if (ang) target_gyro += ang
    moving = false
    // calculate gyro_diff here to avoid data race
    // because you don't know if the assignment in the forever function
    // will be executed before the "pauseUntil" here 
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360
    pauseUntil(() => Math.abs(gyro_diff) < 1, 8000)
    moving = true
}

// Move back for a specified time
function moveBack(time: number) {
    moving_back = true
    pause(time)
    moving_back = false
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
    //Mission18Faucet()
})

// Start Run 2 when button up is pressed
brick.buttonUp.onEvent(ButtonEvent.Bumped, function () {
    Run2()
})

brick.buttonEnter.onEvent(ButtonEvent.Bumped, function () {
    automatic_mode = true
    target_gyro = sensors.gyro4.angle()

    moving_speed = 50
    moving = true
    // move forward for 4.9s
    pause(4900)

    music.playTone(659, 50);
    pauseUntil(() => sensors.color3.reflectedLight() > 60) // detect white

    music.playTone(659, 50);
    pauseUntil(() => sensors.color3.reflectedLight() < 10) // detect black

    music.playTone(659, 50);
    // keep going for .5s after detecting the line
    pause(500)
    // turn left 90 deg
    turnAndWait(90)
    // move forward, slowing down
    moving_speed = 20
    pause(800)
    moveBack(-2000)

    moving_speed = 50
    turnAndWait(90)
    pause(3000)

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
 * turning mode. Use the function `turnAndWait` to pause until the robot
 * is fully turned.
 * 
 * Ideally should have used a class for better encapsulation.
 * But apparently blocks don't support it.
 */
forever(function () {
    // update gyro_diff
    gyro_diff = (sensors.gyro4.angle() - target_gyro) % 360

    // debugging stuff
    brick.showString("color:  " + sensors.color3.reflectedLight(), 1)
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

// For mission 3,4,5: filter, pump, rain
function Run2() {
    automatic_mode = true
    moving = true
    target_gyro = sensors.gyro4.angle()
    moving_speed = 50

    // move forward
    pause(2200)
    // turn left for Mission Filter
    turnAndWait(90)
    // move forward to close the latch
    pause(1000)
    // move back for 1s
    moveBack(1000)
    // turn left 30 deg and go forward
    turnAndWait(30)
    pause(1500)
    // turn right 30 deg, should be facing the pump
    turnAndWait(-30)
    // go hit the pump
    pause(2200)
    // go back
    moveBack(400)
    // turn right for rain
    turnAndWait(-70)
    moving = false
    motors.mediumB.run(50, 370 * 3 + 100, MoveUnit.Degrees) // lower the arm
    motors.mediumB.pauseUntilReady()
    // move under the rain
    moving_speed = 20
    music.playTone(659, 106);
    moving = true
    pauseUntil(() => sensors.color3.reflectedLight() > 60) // detect white
    music.playTone(659, 100);
    pauseUntil(() => sensors.color3.reflectedLight() < 10) // detect black
    moveBack(1800)
    moving = false
    music.playTone(659, 229);

    motors.mediumB.run(-50, 410 + 100, MoveUnit.Degrees) // lift the arm
    motors.mediumB.pauseUntilReady()
    automatic_mode = false
    motors.largeA.run(50, 100, MoveUnit.Degrees)
    pause(1500)
    motors.largeA.run(-50, 150, MoveUnit.Degrees)
    pause(1500)
    //motors.largeAD.steer(0, -50, 180, MoveUnit.Degrees)

    // lower the arm and go forward
    motors.mediumB.run(50, 410, MoveUnit.Degrees) // lower the arm
    motors.largeAD.steer(0, 50, 120, MoveUnit.Degrees)

    music.playTone(659, 229);
    // go back for the pump
    // turn right
    motors.largeA.run(-50, 70, MoveUnit.Degrees)
    motors.largeD.run(50, 70, MoveUnit.Degrees)
    //target_gyro = -10
    //turnAndWait()
    music.playTone(559, 229);
    //moveBack(10000)
    motors.largeAD.steer(0, -50, 1500, MoveUnit.MilliSeconds)
    music.playTone(559, 229);

    // turn right to go back to base
    target_gyro = sensors.gyro4.angle()
    automatic_mode = true
    moving = true
    pause(1000)
    target_gyro = -130
    turnAndWait()
    // speed up and return to the base
    moving_speed = 50
    pause(4000)
    moving = false
}

function Mission09Tripod() {
    moving_speed = 50
    moving = true
    // move forward for 4.9s
    pause(4900)

    music.playTone(659, 50);
    pauseUntil(() => sensors.color3.reflectedLight() > 60) // detect white

    music.playTone(659, 50);
    pauseUntil(() => sensors.color3.reflectedLight() < 10) // detect black

    music.playTone(659, 50);
    // keep going for .5s after detecting the line
    pause(500)

    // turn left 30 deg
    turnAndWait(30)
    // move forward, slowing down
    moving_speed = 20
    pause(800)
    // speed up, starting to turn
    moving_speed = 50
    moveBack(1500)
    target_gyro = -200
    turnAndWait()
    // return to the base
    moving_speed = 80
    pause(6000)
    target_gyro = -90
    pause(2000)
    moving = false
}
