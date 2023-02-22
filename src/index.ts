import dotEnv from 'dotenv'
dotEnv.config()
import { Sequelize, Model, DataTypes, CreationOptional } from 'sequelize' 
import express, {Request} from 'express'
let sequelize:Sequelize
if (typeof process.env.DATABASE_URL === 'string') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
	dialectOptions: { 
		ssl: {
			require: true,
			rejectUnauthorized: false
		}
	}
})} else {
	throw new Error('DATABASE_URL missing!')
}

const app = express()
app.use(express.json())

class Note extends Model {
	declare id: CreationOptional<number>;
	declare content: CreationOptional<string>;
	declare important: CreationOptional<boolean>;
	declare date: CreationOptional<Date>;
}

Note.init({
	 id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	important: {
		type: DataTypes.BOOLEAN
	},
	date: {
		type: DataTypes.DATE
	}}, 
	{
		sequelize,
		underscored: true,
		timestamps: false,
		modelName: 'note'
	}
)

Note.sync()


app.get('/api/notes', async (_req, res) => {
	const notes = await Note.findAll()
	console.log(JSON.stringify(notes, null, 2))
	res.json(notes)
})

app.get('/api/notes/:id', async (req, res) => {
	const note = await Note.findByPk(req.params.id)
	console.log(note?.toJSON())
	if (note) {
		res.json(note)
	} else {
		res.status(404).end()
	}
})

app.put('/api/notes/:id', async (req, res) => {
	const note = await Note.findByPk(req.params.id)
	if (note) {
		note.important = req.body.important
		await note.save()
		res.json(note)
	} else {
		res.status(404).end()
	}
})

app.post('/api/notes', async (req, res) => {
	try {
	// const note = Note.build(req.body)
	// note.important = true
	// await note.save()
	// OR:
	const note = await Note.create(req.body)
	return res.json(note)

	} catch (e) {
		return res.status(400).json({error: e})
	}
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
	console.log(`App listening on ${PORT}`)
})

// const main = async () => {
// 	try {
// 		await sequelize.authenticate()
// 		console.log('Connected to DB!')
// 		const notes = await sequelize.query("SELECT * from NOTES", {type: QueryTypes.SELECT})
// 		console.log(notes)
// 		sequelize.close()
// 	} catch (e) {
// 		console.error('Unable to connect to DB', e)
// 	}
// } 

// main()