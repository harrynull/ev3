let right = 0
let left = 0
let target_gyro = 0
brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    target_gyro = sensors.gyro4.angle()
})
let diff = 0
let ADJUST_CONSTANT = 0
ADJUST_CONSTANT = 3
target_gyro = sensors.gyro4.angle()
function setADAndDisplay(a: number, d: number) {
    brick.showString("left:   " + parseInt("" + a * 10) / 10, 7)
    brick.showString("right:  " + parseInt("" + d * 10) / 10, 8)
    motors.largeAD.tank(a, d)
}
forever(function () {
    diff = sensors.gyro4.angle() - target_gyro
    diff *= ADJUST_CONSTANT;
    left = 70 - diff / 2;
    right = 70 + diff / 2;
    if (left > 100) {
        right -= 100 - left;
        left = 100;
    }
    if (left < -100) {
        right += -100 - left
        left = -100
    }
    if (right > 100) {
        left -= (100 - right);
        right = 100
    }
    if (right < -100) {
        left += -100 - right
        right = -100
    }
    brick.showString("now:    " + sensors.gyro4.angle(), 4)
    brick.showString("target: " + target_gyro, 5)
    setADAndDisplay(left, right);
})
