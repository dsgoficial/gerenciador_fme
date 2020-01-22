import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  rotinaId: Yup.number()
    .required('Selecione uma rotina')
})

export default validationSchema
