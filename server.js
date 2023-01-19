const cors = require('cors')
const express = require('express')
const Sequelize = require('sequelize')
const bodyParser = require('body-parser')
const path = require('path')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'sarcini.db',
  define: {
    timestamps: false
  }
})


const Sarcini= sequelize.define('sarcini', {
  nameEmployee:  {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [3, 20]
    }
},
   
  nameTask: {
    type: Sequelize.TEXT,
 //   allowNull: false,
 //   validate: {
   //   len: [3, 60]
  //  }
  },
  date: Sequelize.DATEONLY

})

const TaskDescription = sequelize.define('taskDescription', {
  parts: {
    type: Sequelize.TEXT,
 //   allowNull: false
  },

  critical: {
    type: Sequelize.NUMBER,
 //   allowNul: false
  }
})




sequelize.sync({ alter: true })
  .then(() => {
    console.log('tables created')
  })

const app = express()

app.use(cors())

app.use(express.static('public'))

app.use(express.json())

app.get('/tasks', async (req, res) => {
  try {
    const task= await Task.findAll()
    res.status(200).json(task)
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }
  }
)

app.post('/tasks', async (req, res) => {
  try {
    await Task.create(req.body)
    res.status(201).json( { message: 'created'})
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }
})

app.get('/tasks/:tid', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid, {include: TaskDescription })
    if(task) {
      res.status(200).json(task)
    } else {
      res.status(404).json( {message: 'not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }


})

app.put('/tasks/:tid', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid)
    if (task) {
      await task.update(req.body, { fields: ['nameEmployee', 'nameTask', 'date']})
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }      
  } catch (error) {
    console.warn(error)
    res.status(500).json( { message: 'some error occured'})
  }
})

app.delete('/tasks/:tid', async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.tid)
    if (task) {
      await task.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
      
  } catch (error) {
    console.warn(error)
    res.status(500).json( { message: 'some error occured'})
  }
})

app.get('/tasks/:tid/taskDescriptions', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid)
    if(task) {
      const taskDescriptions = await task.getTaskDescriptions()
      res.status(200).json(taskDescriptions)
    } else {
      res.status(404).json( {message: 'not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }


})

app.post('/tasks/:tid/taskDescriptions', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid)
    if(task) {
      const taskDescription = req.body
      taskDescription.taskId = task.id
      await TaskDescription.create(taskDescription)
      res.status(201).json( { message: 'created'})
    } else {
      res.status(404).json( {message: 'not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }

})


app.get('/tasks/:tid/taskDescriptions/:did', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid)
    if(task) {
      const taskDescriptions = await task.getTaskDescriptions( { where : { id:req.params.did}})
      const taskDescription =  taskDescriptions.shift()
      if(taskDescription){
      res.status(200).json(task)
      } else {
        res.status(404).json( {message: ' task description not found'})
      }
    } else {
      res.status(404).json( {message: ' task not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }

})

app.put('/tasks/:tid/taskDescriptions/:did', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid)
    if(task) {
      const taskDescriptions = await task.getTaskDescriptions( { where : { id:req.params.did}})
      const taskDescription =  taskDescriptions.shift()
      if(taskDescription){
        await taskDescription.update(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json( {message: ' task description not found'})
      }
    } else {
      res.status(404).json( {message: ' task not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }
})

app.delete('/tasks/:tid/taskDescriptions/:did', async (req, res) => {
  try{
    const task = await Task.findByPk(req.params.tid)
    if(task) {
      const taskDescriptions = await task.getTaskDescriptions( { where : { id:req.params.did}})
      const taskDescription =  taskDescriptions.shift()
      if(taskDescription){
        await taskDescription.destroy(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json( {message: ' task description not found'})
      }
    } else {
      res.status(404).json( {message: ' task not found'})
    }
  } catch (err) {
    console.warn(err)
    res.status(500).json( { message: 'some error occured'})
  }
})
















app.use((err, req, res, next) => {
  console.warn(err)
  res.status(500).json({ message: 'server error' })
})

app.listen(8080, async () => {
  try {
    await sequelize.authenticate()
    console.warn('Connected')
  } catch (error) {
    console.warn('Unable to connect to db')
    console.warn(error)
  }
})