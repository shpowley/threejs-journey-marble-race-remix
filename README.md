"Marble Race" (https://threejs-journey.com) re-imagined for mobile | mobile-AR | headset-VR | headset-AR.

Tested on Android mobile + Chrome AND Quest 3 headset + Quest browser only. Other devices / browsers may or may not work. Any feedback regarding other headset/browser combos, code suggestions, etc. is much appreciated.

This project serves as a mobile and webxr experiment that builds on the final lesson in multiple phases via github "tags".

0-base-game
- desktop experience with keyboard controls
- threejs-journey final lesson (mostly unchanged)

1-mobile
- android mobile + chrome browser with DOM touch + virtual joystick controls
- PORTRAIT or LANDSCAPE modes

2-mobile-ar
- android mobile + chrome browser with DOM touch + virtual joystick controls
- PORTRAIT or LANDSCAPE modes
- AR minified toy obstacle course

3-headset-vr
- quest 3 headset + quest browser + controllers
- 3rd-person chase cam "locked" POV

4-headset-ar
- quest 3 headset + quest browser + controllers
- AR minified toy obstacle course

5-ar-hit-test
- adds webxr "hit-testing" to placement of the toy obstacle course of a flat surface
- NOTE: hit-test placement feature is broken on react-three/xr + android at the moment, but playable
- additional features such as headset-vr camera-lock modes
