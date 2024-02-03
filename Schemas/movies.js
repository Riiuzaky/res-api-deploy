import z from 'zod'

const moviSchema = z.object({
    title: z.string({
      invalid_type_error: 'Movie title must be a String',
      required_error: 'Movie title is required'
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
      message: 'Poster must be a valid URL'
    }),
    genre: z.array(
      z.enum(['Action', 'Adventure', 'Fantasia', 'Sci-Fi', 'Drama', 'Animation', 'Biography', 'Romance', 'Crime', 'Anime']),{
        required_error: 'Movie title is required',
        invalid_type_error: 'Movie gnre must be an array of enum Genre'
      }
    )
  })

  export function validateMovie (object) {
    return moviSchema.safeParse(object)
  }

  export function valdiatePartialMovie(object){
    return moviSchema.partial().safeParse(object)
  }