# MangaFox Scraper
Returns data from MangaFox in json

### Prerequisites
* install Node
* clone or download this repository
* cd into folder
* npm install

### Run local
I recommend using nodemon inplace of the standerd node start command. To install nodemon run ```npm install -g nodemon```
Then to run the application use ```nodemon start``` and vist localhost:1337 to check if it works

### Run on production
Use fover.js https://github.com/foreverjs/forever docu will explain how it works

### Routes

* http://mangafox.me/manga/ = /manga/all (will make a json dump every hour)
* http://mangafox.me/directory/new/ = /manga/new (will return newly added manga)
* http://mangafox.me/releases = /manga/recent/:id (:id stands for page number)
* http://mangafox.me/directory/ = /manga/hot/:id (:id stands for page number)
* http://mangafox.me/manga/one_piece/ = /manga/show/:name (:name stands for manga name)
* http://mangafox.me/manga/one_piece/vTBD/c795/1.html = /manga/read/:name/:volume/:chapter/:id (example: /manga/read/one_piece/TBD/c795/1)

__Any requests are welcome__
