const fs = require('fs');
const path = require('path');
const Joi = require('joi'); // lib validacion de campos
const bcrypt = require('bcrypt'); // lib encriptacion 
const jwt = require('jsonwebtoken'); // lib autenticacion

// definir la ruta del archivo de datos
const userFilePath = path.join(__dirname, '../data/user.json');


// obtener datos del archivo json
const readUsersFromFile = ()=>{
    const data = fs.readFileSync(userFilePath, 'utf-8');
    return JSON.parse(data);
}
// escribe datos en el archivo json
const writeUserFile = (user)=>{
    try {
        fs.writeFileSync(userFilePath, JSON.stringify(user, null, 2));
    } catch (error) {
        console.log(error);
    }
}

// Crear usuario
exports.create = async(req, res)=>{
    // definir esquema de validacion
    console.log('creation...');
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        password: Joi.string().min(6).required(),
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
            id: users.length + 1,
            username, email, 
            password: hashedPass
        }

        // agregar a la lista de datos actual y escribir en el archivo
        users.push(user);
        writeUserFile(users);

        res.status(201).json({message: 'Usuario creado.'});
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: 'Error de ejecucion.'})
    }
}

exports.update = (req, res) => {
    try {
        const { id, username, email, password } = req.body;
        let users = readUsersFromFile();
        let userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) return res.status(404).json({ message: 'Usuario no encontrado' });

        const updateData = { ...users[userIndex], username, email, password };
        if (password){
            const salt = bcrypt.genSaltSync(10);
            updateData.password = bcrypt.hashSync(password, salt);
        }
        users[userIndex] = updateData;
        writeUserFile(users);

        res.json({ message: 'Usuario actualizado', user: updateData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error de procesamiento' });
    }
}

exports.remove = (req, res) => {
    try {
        // const { id } = req.body;
        const { id } = req.params;
        if (!id) return res.status(404).json({ message: 'Usuario desconocido' });
        const users = readUsersFromFile();
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        
        if (userIndex === -1) return res.status(404).json({ message: 'Usuario no encontrado' });
        
        users.splice(userIndex, 1);
        writeUserFile(users);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error de procesamiento' });
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
    // const name = req;
    // console.log(name);
    try {
        const email = req.query.id;
        if (!email) return res.status(401).res.json({message: "email desconocido"});
        res.json({resp: 'dasdasd'})
    } catch (error) {
        res.json({message: 'Error: Email desconocido'})
        console.log('err');
    }
}

exports.getall = (req, res) => {
    const users = readUsersFromFile();
    if (!users) return res.status(404).json({message: 'datos no encontrados'});
    res.json({data: users})
}