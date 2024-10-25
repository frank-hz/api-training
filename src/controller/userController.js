const fs = require('fs');
const path = require('path');
const joi = require('joi'); // lib validacion de campos
const bcrypt = require('bcrypt'); // lib encriptacion 
const jwt = require('jsonwebtoken'); // lib autenticacion

// definir la ruta del archivo de datos
const userFilePath = path.join(__dirname, '../data/exercise.json');


// obtener datos del archivo json
const readUsersFromFile = ()=>{
    const data = fs.readFileSync(userFilePath, 'utf-8');
    return JSON.parse(data);
}
// escribe datos en el archivo json
const writeUserFile = (user)=>{
    fs.writeFileSync(userFilePath, JSON.stringify(user, null, 2));
}

// Crear usuario
exports.create = async(req, res)=>{
    // definir esquema de validacion
    const schema = Joi.object({
        username: Joi.string().min(3).require(),
        password: Joi.string().min(6).require,
        email: Joi.string().email().required()
    });

    // valida si los campos son correctos
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({messge: error.details[0].message});
    }
    // desestructurar y obtener datos
    const { username, password, email } = req.body;

    try {
        let users = readUsersFromFile();
        let user = users.find(us => us.email === email);
        if ( user ) return res.status(400).json({message: 'Usuario ya existente.'});
        
        // salt: cantidad de veces que se procesara el hash 
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // crear objeto con los datos del usuario
        user = {
            id: user.length + 1,
            username, email, 
            password: hashedPass
        }

        // agregar a la lista de datos actual y escribir en el archivo
        users.push(user);
        writeUserFile(users);

        res.status(201).json({message: 'Usuario creado.'});
        
    } catch (error) {
        res.status(500).json({message: 'Error de ejecucion.'})
    }
}


exports.login = async (req,res) => {
    const {email, password} = req.body;
    try {
        const users = readUsersFromFile();
        const user = user.find(us => us.email === email);
        if (!user) return res.status(400).json({messsage: 'Usuario no encontrado'});

        // compara la contraseñas usando una funcion de encriptacion
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) return res.status(400).json({message: 'Contraseña incorrecta.'});
        
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error de procesamiento.' });
    }
}


exports.profile = (req, res) => {
    console.log(req.user);
    try {
        const users = readUsersFromFile();
        const user = users.find(us => us.id === req.user.id);
        if (!user) return res.status(404).json({  message: 'Usuario no encontrado.' });

        res.json({ message: 'Datos del usuario', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error de procesamiento.' });
    }
}

exports.randuser = (req, res) => {
    const name = req;
    console.log(name);
    res.json({resp: 'dasdasd'})
}
