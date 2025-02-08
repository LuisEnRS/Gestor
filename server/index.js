
const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const DB = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"usuarios_crud"
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});


app.post("/create",(req, res) => {
    console.log(req.body);
    const { nombre, monto, descripcion, fechaDelPrestamo, fechaDelCobro, tipo, numeroCuenta, nombreBanco } = req.body;

    if(!nombre || !monto || !descripcion || !fechaDelPrestamo || !fechaDelCobro || !tipo) {
        return res.status(400).send("Todos los campos son requeridos.")
    }

    else if(tipo === "acreedor" && (!numeroCuenta || !nombreBanco)) {
      return res.status(400).send("Para los ACREEDORES, el 'Numero de Cuenta' y el 'Nombre de Banco' son requeridos.")
    }

    DB.query('INSERT INTO usuarios(nombre, monto, descripcion, fechaDelPrestamo, fechaDelCobro, tipo, numeroCuenta, nombreBanco ) VALUES(?,?,?,?,?,?,?,?)', 
        [nombre, monto, descripcion, fechaDelPrestamo, fechaDelCobro, tipo, numeroCuenta, nombreBanco],
        (err, result) => {
         if (err){
            console.log("Error al insertar:", err);
            res.status(500).send("Error en el servidor.");
         } else {
            res.send("Registro Exitoso");
         }
        }
    );
});

app.get("/usuarios", (req, res) => {
  const { tipo } = req.query;
  let query = "SELECT * FROM usuarios";
  let params = [];

  if (tipo) {
    query += " WHERE tipo = ?";
    params.push(tipo);
  }

  DB.query(query, params, (err, result) => {
    if (err) {
      console.error("Error al obtener usuarios:", err);
      return res.status(500).json({ message: "Error al obtener los usuarios" });
    }

    res.json(result);
  });
});

app.put("/update", (req, res) => {
  console.log(req.body);
  const { ID, nombre, monto, descripcion, fechaDelPrestamo, fechaDelCobro, tipo, numeroCuenta, nombreBanco } = req.body;

  if (!ID || !nombre || !monto || !descripcion || !fechaDelPrestamo || !fechaDelCobro || !tipo) {
    return res.status(400).send("Todos los campos son requeridos.");
  }

  let query = "UPDATE usuarios SET nombre=?, monto=?, descripcion=?, fechaDelPrestamo=?, fechaDelCobro=?, tipo=?";
  let params = [nombre, monto, descripcion, fechaDelPrestamo, fechaDelCobro, tipo];

  if (tipo === "acreedor") {
    query += ", numeroCuenta=?, nombreBanco=?";
    params.push(numeroCuenta, nombreBanco);
  } else {
    query += ", numeroCuenta=NULL, nombreBanco=NULL"; // Eliminar datos anteriores si cambia a deudor
  }

  query += " WHERE ID=?";
  params.push(ID);

  DB.query(query, params, (error, results) => {
    if (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).send("Error al actualizar el usuario.");
    } else {
      console.log("Usuario actualizado correctamente:", results);
      res.send("Usuario actualizado correctamente.");
    }
  });
});

app.delete("/delete/:ID",(req, res) => {
    console.log(req.params);
    const { ID } = req.params;

    DB.query(
        'DELETE FROM usuarios WHERE ID = ?',[ID],
        (error, results) => {
          if (error) {
            console.error("Error al eliminar el usuario:", error);
            res.status(500).send("Error al eliminar el usuario.");
          } else {
            console.log("Usuario eliminado correctamente:", results);
            res.send("Usuario eliminado correctamente.");
          }
        }
      );
    });

app.listen(3001,()=>{
    console.log("Corriendo en el puerto 3001");
})