# pi

calculate pi

## why?

i need to know pi

## methodology

the most convoluted way possible

## requirements

`node`

`redis-server`

## examples

    node index.js s3://lab.userhostilesoftware.com/felix/sources/1k.csv

    node index.js s3://lab.userhostilesoftware.com/felix/sources/1mm.csv

    node index.js s3://lab.userhostilesoftware.com/felix/sources/10mm.csv

These files look like this:

    0.25008359797885515,-0.12253391152031234
    0.25671068645112394,0.6236567284188683
    0.5489052378982133,0.3628287655159652
    -0.7161118031711806,0.6128895667451084
    -0.3556614742846562,-0.5742847542854475
    -0.7107119171413923,-0.3800788981027228
    0.821927211540268,-0.6761022190782098
    0.8972711532788986,0.32230451489339096
    0.3831193475614978,0.8239172304833862
    0.8370952005042178,0.7065482115404758

## flow

![image](https://raw.githubusercontent.com/akreiling/pi/main/assets/flow.jpg)

Following the columns from left to right:

1. CSV file of random [x, y] values is stored on S3
2. ƒ(:one:) parses CSV into [x, y] tuples and emits the tuple to a single stream
3. ƒ(:two:) simply applies a fan-out to the stream into _n_ partitions
4. ƒ(:three:) spawns an indepenent processes per partition that calculate if
   the [x, y] tuple is inside the circle, maintain a running count of the number
   of points in the circle and total points, and finally calculates an
   approximation of _pi_
5. f(:four:) aggregates the results of the partitions and calculates a running
   average of the _pi_ approximation onto a final stream whose _last_ value should
   converge to _pi_
