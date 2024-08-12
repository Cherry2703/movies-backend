const express = require("express");
const path = require("path");

const cors=require('cors')

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const bcrypt=require('bcrypt')
const app = express();

app.use(express.json())
app.use(cors())

const dbPath = path.join(__dirname, "./database.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("database connected and Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();



// home page 
app.get("/",(request,response)=>(
    response.send('Connected to database....')
))

//get all the users in the users-table

app.get('/users/',async (request,response)=>{
    const query=`select * from users order by user_id;`;
    const result_response=await db.all(query)
    response.send(result_response)
})


//add new user to the users database

app.post("/users/register/", async (request, response) => {
    const { name, password ,location } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM users WHERE user_name = '${name}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          users (user_name, user_password, location) 
        VALUES 
          (
            '${name}',
            '${hashedPassword}',
            '${location}'
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists please try with new name thank you!!!");
    }
  });


app.delete("/users/:id",async(request,response)=>{
    const {id}=request.params
    const query=`delete from users where user_id=${id}`
    await db.run(query)
    response.send('uses deleted successfully...')
})


//get all movies data

app.get('/movies/',async(request,response)=>{
    const all_movies=`select * from movies order by movie_id;`;
    const result_response=await db.all(all_movies)
    response.send(result_response)
})


//get specific movie details
app.get('/movies/:id/',async(request,response)=>{
    const {id}=request.params
    const get_specific_movie=`select * from movies where movie_id=${id};`
    const result=await db.get(get_specific_movie)
    response.send(result)
})


//adding new movie
app.post("/movies/",async(request,response)=>{
    const {title,year,genre,director,actors,imdbRating}=request.body   
    const query=`INSERT INTO movies(movie_name,released_year,genre,director,actors,rating) values('${title}','${year}','${genre}','${director}','${actors}',${imdbRating});`;
    await db.run(query)
    response.send('Movie added succefully...')
})


//update a movie

app.put("/movies/:id/",async(request,response)=>{
    const {id}=request.params
    const {title,year,genre,director,actors,rating}=request.body
    const query=`
    update movies
    set
    movie_name='${title}',
    released_year='${year}',
    genre='${genre}',
    director='${director}',
    actors='${actors}',
    rating='${rating}'
    where movie_id=${id};`;
    await db.run(query)
    response.send('updated successfully')
})


//delete a movie 

app.delete("/movies/:id/",async(request,response)=>{
    const {id}=request.params
    const query=`delete from movies where movie_id=${id};`;
    await db.run(query)
    response.send('movie deleted successfully...')
})