# DEPRECATED! Project handed over to SoftServe Academy, their re-write lives here: 
http://ecomap.org

# EcoMap - collaborating to solve ecological problems

## The idea

- Enable people to add ecological problems, specifying a number of problem attributes, geographic location and photo proof
- Enable people to browse problems already reported by others
- Enable people to commit to solving a problem. At the moment this is done by providing an email address. It is then up to moderators to organise activists via mailing lists. In the future we would like to add more automation to this process, enabling usrs to collaborate using something similar to FB groups or Google hangouts
- Provide useful information about how to address common ecological problems (this is what we reffer to as static content)
- Enable interested parties to analyse data about ecological problems (we have plans for developing a full-blown admin panel that will be used by moderators). Data in it's raw form is freely available via the REST API, future plans include adding support for exports into KML or any other useful GIS formats.
- We are also planning to roll out a mobile app for Andriod and iOS that would make use of the same backend interface.  

## Our stack

- Persistance layer using MongoDB
- Backend API and admin panel using node.js + Mongoose + Express.js & bits
- Front-end using Backbone and Leaflet.js (http://leafletjs.com/) 
- Developemnt workflow using Grunt, Bower and npm
