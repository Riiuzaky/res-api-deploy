import express from 'express'
import { readFile, writeFile } from 'node:fs/promises'
import crypto from 'node:crypto'
import { valdiatePartialMovie, validateMovie } from './Schemas/movies.mjs'
import cors from 'cors'

// const movies = JSON.parse(fs.readFileSync('./movies.json, utf-8))

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const movies = require('./movies.json')

const app = express()

app.use(express.json())

app.disable('x-powered-by')
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'https://movies.com',
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
  })
)

const PORT = process.env.PORT ?? 1234

app.get('/movies', async (req, res) => {
  try {
    const { genre } = req.query
    //const moviesBuffer = await readFile('./movies.json')
    //const movies = JSON.parse(moviesBuffer)
    if (genre) {
      const filteredMovies = movies.filter((movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
      )
      res.json(filteredMovies)
    } else {
      res.json(movies)
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor ' })
  }
})

app.get('/movies/:id', async (req, res) => {
  try {
    const { id } = req.params
    //const moviesBuffer = await readFile('./movies.json')
    //const movies = JSON.parse(moviesBuffer)
    const movie = movies.find((movie) => movie.id === id)
    if (movie) {
      res.json(movie)
    } else {
      res.status(404).json({ message: '404 Movie not Found ' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor ' })
  }
})

app.post('/movies', async (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  //const moviesBuffer = await readFile('./movies.json')
  //const movies = JSON.parse(moviesBuffer)

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
    // title,
    // genre, 
    // year,
    // director,
    // duration,
    // rate: rate ?? 0,
    // poster,
  }
  movies.push(newMovie)
  await writeFile('./movies.json', JSON.stringify(movies))
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', async (req, res) => {
  const result = valdiatePartialMovie(req.body)

  if (!result) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  //const moviesBuffer = await readFile('./movies.json')
  //const movies = JSON.parse(moviesBuffer)
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not Found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  }

  movies[movieIndex] = updateMovie
  await writeFile('./movies.json', JSON.stringify(movies))
  return res.json(movies[movieIndex])
})


app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params
  //const moviesBuffer = await readFile('./movies.json')
  //const movies = JSON.parse(moviesBuffer)
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  await writeFile('./movies.json', JSON.stringify(movies))
  return res.json({ message: 'Movie deleted' })
})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
