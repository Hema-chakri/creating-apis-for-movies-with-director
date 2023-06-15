const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//Get Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie
    ;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Add Movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO
    movie(director_id, movie_name, lead_actor)
  VALUES
  (
      ${directorId},
      '${movieName}',
      '${leadActor}'
  );`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});
