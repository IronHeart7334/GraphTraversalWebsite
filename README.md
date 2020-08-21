# Graph Traversal Website
  A redone version of my Wayfinding system.

## Summary
  My very first professional programming job was working on the Wayfinding project for the American River College campus, which you can find [here](https://github.com/design-hub-arc/Wayfinding).
Being that this was my first major programming job, I lacked a lot of the experience I have now, and so there are many parts of that project I am not satisfied with.
Since the Wayfinding project has been passed off to the far more skilled ARC official programming department, and backwards compatibility would be rather unpleasant, I decided to make an entirely new project based on the Wayfinding system, rather than attempting to salvage what already exists.
  For those unfamiliar with the Wayfinding system, it is a somewhat basic graph traversal website used to calculate routes through the ARC campus. The specifics of how the system works and the standards its files follow are beyond the scope of this README file, ~~and are left as an exercise to the reader~~. (The semester starts soon, so I don't have time to fully document this).

## Running the Project
This program can be tested on localhost by running the `launch.bat` file. Note that the test data used by this program expects the localhost server to listen on port 8000, so hosting on other ports won't work. If you modify the program to
use a different data set, you needn't worry about this.
Upon launching the batch file, open your favorite web browser, and navigate to `http://localhost:8000/`.
See parameters.js for a list of URL parameters you can pass to modify the program's behavior.
Yes, the website is not very good. Yes, it isn't complete. But, I don't have time to work on this.

## Helpful Links
* [JQuery](https://learn.jquery.com/using-jquery-core/)
* [Bootstrap](https://getbootstrap.com/docs/4.5/getting-started/introduction/)

## To Do
* Convert version log from CSV format to JSON (will allow me to fix csv::addRow)
* Fix non-critical, theoretical error detailed in Graph::addVertex
