
const Estudiante = require('../models/Estudiante');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

const configuracionMulter = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido'));
    }
  }
};

// pasar la configuración y el campo
// Configurar multer con la configuración y los campos necesarios
const upload = multer(configuracionMulter).fields([
  { name: 'imagenDocumento', maxCount: 1 },
  { name: 'imagenVoleto', maxCount: 1 },
  { name: 'imagenPermiso', maxCount: 1 },
  { name: 'imagenPerfil', maxCount: 1 }
]);

// Subir archivos
exports.subirArchivo = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      res.json({ mensaje: error.message });
    }
    return next();
  });
};

// Agregar un nuevo estudiante
exports.nuevoEstudiante = async (req, res, next) => {
  try {
    const estudiante = new Estudiante(req.body);

    if (req.files['imagenDocumento']) {
      estudiante.imagenDocumento = req.files['imagenDocumento'][0].filename;
    }

    if (req.files['imagenVoleto']) {
      estudiante.imagenVoleto = req.files['imagenVoleto'][0].filename;
    }

    if (req.files['imagenPermiso']) {
      estudiante.imagenPermiso = req.files['imagenPermiso'][0].filename;
    }
    if (req.files['imagenPerfil']) {
      estudiante.imagenPerfil = req.files['imagenPerfil'][0].filename;
    }

    await estudiante.save();

    // Convertir el objeto a cadena JSON
    const jsonStr = JSON.stringify(estudiante._id);



    // Generar el código QR y guardarlo como archivo
    qrcode.toFile('codigo_qr.png', jsonStr, async (err) => {
      if (err) {
        console.error('Error al generar el código QR:', err);
        return;
      }
      console.log('Se ha generado el código QR correctamente.');

      // Configurar el servicio de correo electrónico
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'krisnaspiral@gmail.com',
          pass: 'wmingyhpgzydjerp'
        }
      });

      // Leer el archivo de código QR generado
      const qrCode = fs.readFileSync('codigo_qr.png');

      // Adjuntar el archivo al correo electrónico
      const mailOptions = {
        from: 'krisnaspiral@gmail.com',
        to: estudiante.email,
        subject: 'Código QR del producto',
        html: `<p>Hola${estudiante.nombre} ${estudiante.apellido}<br>
        
        Gracias por registrate con nosotros le enviamos su codigo Qr que podra usar en su viaje.</p> `,
        attachments: [{
          filename: 'codigo_qr.png',
          content: qrCode
        }]
      };

      try {
        // Enviar el correo electrónico
        const info = await transporter.sendMail(mailOptions);
        console.log('Correo electrónico enviado:', info.messageId);
      } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
      }
    });

    
    res.json({ mensaje: 'Se agregó un nuevo estudiante' });
  } catch (error) {
    console.log(error);
    next();
  }

};

exports.mostrarEstudiante = async (req, res, next) => {
  try {
    const estudiantes = await Estudiante.find({});
    const estudiantesCount = await Estudiante.countDocuments({});
    res.json({ estudiantes, estudiantesCount });
  } catch (error) {
    console.log(error);
    next();
  }
};


exports.mostrarEstudianteId = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id)
    // .populate({ path: "category", select: "_id, name" })
    // .populate({ path: "categories", select: "_id name" });

    res.send(estudiante);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

exports.cambiarEstatusEstudianteID = async (req, res) => {
  try {
    const estudianteId = req.params.id;
    const updatedStatus = req.body.estatus;

    if (typeof updatedStatus !== 'boolean') {
      return res.status(400).json({ message: 'El estatus debe ser un valor booleano (true o false)' });
    }

    const estudiante = await Estudiante.findByIdAndUpdate(estudianteId, { estatus: updatedStatus });

    if (!estudiante) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Estatus del usuario actualizado exitosamente', estudiante });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estatus del usuario', error });
  }
};

exports.getEstudiantesInactivos = async (req, res, next) => {
  try {
    const estudiantes = await Estudiante.find({ estatus: false });
    const estudiantesCount = estudiantes.length;
    res.json({ estudiantes, estudiantesCount });
  } catch (error) {
    console.log(error);
    next();
  }
};

exports.cambiarEstatusEstudiantes = async (req, res) => {
  try {
    await Estudiante.updateMany({}, { estatus: false });
    res.status(200).json({ message: 'Estatus de todos los usuarios cambiado a false' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estatus de los usuarios' });
  }
};

