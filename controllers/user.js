const jwt = require('jsonwebtoken')
const User = require('../models/user')

const generateToken = (id) => {
   return jwt.sign({ id }, 'token123', { expiresIn: '30d' })
 }

const addUser = async (req, res, next)=>{
   const { name, num ,sexe, poste, email, password, imageUrl, isAdmin, adminId }= req.body

   let existingUser
   try {
     existingUser = await User.findOne({ email })
   } catch (error) {
     console.log('error')
   }
 
   if(existingUser){
     res.status(400).send({message: 'login instead'})
     throw new Error('login instead')
   }

   const createdUser = new User({
      name, 
      num, 
      sexe,
      poste, 
      email, 
      password, 
      imageUrl,
      isAdmin, 
      adminId
   })

   try {
    await createdUser.save()
  } catch (err) {
    res.status(400).send(err)
  }

  res
    .status(201)
    .json({ user: createdUser, id: createdUser._id, token: generateToken(createdUser._id) })
}

const login = async (req, res, next) => {
  const { email, password } = req.body
  let user
  try {
    user = await User.findByCredentials(email, password, res)
  } catch (err) {
    console.log(err)
  }

  res
    .status(200).json({
      message: 'Loged in',
      id: user._id,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      info: {
        name: user.name,
        num: user.num,
        sexe: user.sexe,
        poste: user.poste,
        email: user.email,
        imageUrl: user.imageUrl
      }
    })
    
}

const getUsers = async (req, res, next) => {
   let users
   try {
     users = await User.find().select('-password')
   } catch (err) {
     res.status(400).send(err)
   }
 
   res.status(200).json({ users: users })
}

const getUserById = async (req, res, next) => {
   const userId = req.params.userId
   let user
   try {
     user = await User.findById(userId).select('-password')
   } catch (err) {
     res.status(400).send(err)
   }
   if (!user) {
     res.status(404).send('no user found with this Id')
   }
   res.status(200).json({ user: user })
}

const updateUser = async (req, res, next) => {
   const { name, num, sexe, poste, email, password, imageUrl } = req.body
 
   const userId = req.params.userId
 
   let user
   try {
     user = await User.findById(userId)
   } catch (err) {
     res.status(400).send(err)
   }
 
   user.name = name
   user.num = num
   user.sexe = sexe
   user.poste = poste
   user.email = email
   user.password = password
   user.imageUrl = imageUrl
 
   try {
     await user.save()
   } catch (err) {
     res.status(400).send(err)
   }
 
   res.status(200).json({ message: 'updated' })
 }

 const deleteUser = async (req, res, next) => {
   const userId = req.params.userId
 
   try {
     await User.findByIdAndRemove(userId)
   } catch (err) {
     return console.log(err)
   }
 
   res.status(200).json({ message: 'deleted' })
}

exports.addUser = addUser
exports.getUsers = getUsers
exports.getUserById = getUserById
exports.updateUser = updateUser
exports.deleteUser = deleteUser
exports.login = login