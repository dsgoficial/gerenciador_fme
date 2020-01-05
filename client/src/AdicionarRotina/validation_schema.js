import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  nome: Yup.string()
    .required('Preencha o nome da rotina'),
  descricao: Yup.string()
    .required('Preencha a descrição da rotina'),
  categoria: Yup.number()
    .required('Preencha a categoria da rotina'),
  file: Yup.mixed().required('É necessário enviar um arquivo .fmw')
})

export default validationSchema
