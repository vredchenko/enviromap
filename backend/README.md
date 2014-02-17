# RESTful API

Don't forget to set up imagemagick CLI on your system!

## Add new problem object

```
curl -i -X POST -H "Content-Type: application/json" -d '{"title" : "Ipsum ipsam iure perferendis architecto alias, fuga, ullam, nisi nostrud fugit.","content" : "Cupidatat pariatur dolores eu necessitatibus debitis, et enim voluptatem sunt tenetur rem magni necessitatibus iusto veritatis consequatur cum, voluptas veniam incididunt fugit commodi aut culpa amet vitae nostrum modi saepe. Quia laudantium vitae est eveniet itaque aliquip quis quas ipsam tempor earum aliquid quas laborum sed assumenda veniam nam id aliqua. Iste excepteur voluptatibus minima nostrud molestiae reprehenderit dicta magnam necessitatibus perspiciatis tempora eius cupidatat. Tempora ab optio mollitia corporis ab, ab adipisci qui consequat voluptatem, amet eiusmod lorem voluptate excepteur eos aute sit eveniet minim enim eum impedit facere eum ab est.\r\n\r\nLaudantium hic reiciendis explicabo eius maiores quam ipsam sit dolor delectus praesentium sapiente sit laboris quaerat rerum recusandae lorem itaque eaque sapiente neque quis. Quidem nobis numquam veniam dolor non vero dicta omnis reiciendis recusandae incididunt voluptas necessitatibus impedit commodo enim maxime tempor asperiores possimus dignissimos dolorum minus aliquam quasi doloremque iusto ullam. Ipsam fugiat quidem natus minim facere maiores ullam, excepteur accusamus velit, laudantium quisquam perferendis.\r\n\r\nVoluptas iusto consequatur sint lorem occaecati mollitia elit eius mollitia nulla voluptates voluptate, nostrum mollitia, cupidatat atque aut totam et hic cupidatat maiores quidem illo placeat. Iure recusandae iusto aliqua aspernatur magnam commodi sint inventore nihil incidunt asperiores error est reprehenderit consectetur do. Debitis eius quis facilis aliquid non anim eos iusto aliqua aliquid.","lat" : 46.858882222537495,"lon" : 26.804343218249596,"moderation" : "Not approved yet","probType" : "Waste dump","probStatus" : "Resolved","severity" : 3}' http://127.0.0.1:8000/problems 
```

## Upload photos to an existing problem

This implementation will probably change in the future, but for now here's how: 
photos can only be uploaded to a problem that already exists in the database, and all you need is a problem id.

```
curl -F "userid=1" -F "filecomment=This is an image file" -F "image=@/home/user1/Desktop/test.jpg" http://127.0.0.1:8000/problems/photos/{_id}
```

NOTE: CURL syntax not tested yet!

## To get all problem objects

```
curl -is http://127.0.0.1:8000/problems
```

## To find problems using filters

Any combination of the following filters can be used:

```
curl -i -X POST -H "Content-Type: application/json" -d '{"moderation":["Approved"],"probType":["Deforestation","Flood"],"probStatus":["New","Failed"],"severity":{"lowerBound":2,"upperBound":4}}' http://127.0.0.1:8000/problems/filter
```

## Delete a problem

```
@todo
```

## Find a single problem by ID

```
@todo
```

## Find specific problem objects using filters

```
@todo
```

## Update a problem

```
@todo
```

## Settings

```
curl -is http://127.0.0.1:8000/settings
```

## Notes:

 - see about deploying to https://www.openshift.com/ here: https://www.openshift.com/blogs/day-27-restify-build-correct-rest-web-services-in-nodejs

 - add indexes

 - add gzip support to API
