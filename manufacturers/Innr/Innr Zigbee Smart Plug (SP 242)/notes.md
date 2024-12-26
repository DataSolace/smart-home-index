# Innr Zigbee Smart Plug (SP 242)

[SP242 zigbee2mqtt device page](https://www.zigbee2mqtt.io/devices/SP_242.html)

[Innr SP242 instruction manual](https://www.innr.com/wp-content/uploads/2024/04/INNR_IM_SP-242_WT10.pdf)

## Factory Reset Sequence

Press and hold power button for 5 seconds. The power LED will begin to flash 5 times - this entered the device into zigbee pairing mode and will be ready to complete an interview.

## Active Issues

[Innr SP-242 Smart Plug not reporting status automatically](https://github.com/Koenkk/zigbee-herdsman-converters/issues/6747)

Status: *Open*. Last update: GerryInnr commented on *Nov 26* - `I expect to be able to release a new firmware in December 2024 or January 2025`.

The SP242 running firmware 1.43 does not always automatically report power and energy updates, requiring a manual refresh in zigbee2mqtt. This can be resolved by shortening the default reporting intervals (Min rep interval) and minimum reported changed (min rep change). 

I have experienced no change after an upgrade to firmware 1.7.23, so set these reporting values in zigbee2mqtt:

- activePower
    - Min rep interval: 1
    - Min rep change: 0.001
- currentSummDelivered
    - Min rep interval: 1
    - Min rep change: 0.001

[Tombo1001](https://github.com/tombo1001)

---