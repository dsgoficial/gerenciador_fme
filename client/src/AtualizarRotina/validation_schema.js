import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  rotina: Yup.number()
    .required('Preencha a rotina que será atualizada'),
  file: Yup.mixed().required('É necessário enviar um arquivo .fmw')
})

export default validationSchema
