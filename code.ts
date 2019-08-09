let rotating_speed = 30
let moving_speed = 80
let ADJUST_CONSTANT = 3
let moving_back = false
let moving = true
let automatic_mode = true
let target_gyro = 0
let gyro_diff = 0
let BothTouchSensorsPressed = () => sensors.touch1.isPressed() && sensors.touch2.isPressed();

brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
    target_gyro = sensors.gyro4.angle()
})
pauseUntil(() => brick.buttonEnter.isPressed())
// start first run
target_gyro = sensors.gyro4.angle()
moving_back = true;
pauseUntil(BothTouchSensorsPressed)
target_gyro = sensors.gyro4.angle()
moving_back = false

let last_bright_detected_time = 0
sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Bright, function () {
    last_bright_detected_time = control.timer1.seconds()
})
sensors.color3.onLightDetected(LightIntensityMode.Reflected, Light.Dark, function () {
    if (control.timer1.seconds() - last_bright_detected_time > 0.5) return
    moving = false
    target_gyro -= 90
    pauseUntil(()=>gyro_diff<1)
    moving = true
    moving_back = true
    pauseUntil(BothTouchSensorsPressed)
    target_gyro = sensors.gyro4.angle()
    moving_back = false
    loops.pause(1000)
    moving=false
})

forever(function () {
    if (!automatic_mode) {
        return;
    }
    // automatic mode code navigate through gyro sensor
    // will move towards "target_gyro"
    gyro_diff = (sensors.gyro4.angle() - target_gyro) * ADJUST_CONSTANT
    brick.showString("now:    " + sensors.gyro4.angle(), 4)
    brick.showString("target: " + target_gyro, 5)
    brick.showString("left:   " + parseInt("" + motors.largeA.speed() * 10) / 10, 7)
    brick.showString("right:  " + parseInt("" + motors.largeD.speed() * 10) / 10, 8)
    if (moving || gyro_diff != 0) {
        motors.largeAD.steer(0 - gyro_diff, (moving_back ? -1 : 1) * (moving ? moving_speed : rotating_speed))
    }
    loops.pause(100)
})
