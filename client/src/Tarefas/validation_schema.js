import * as Yup from 'yup'
const cron = require('cron-validator')

const cronSchema = Yup.object().shape({
  nome: Yup.string()
    .required('Preencha o nome do agendamento'),
  rotinaId: Yup.number()
    .required('Selecione uma rotina'),
  configuracao: Yup.string().test('cron', 'Siga o padrão Cron',
    value => {
      if (value) {
        return cron.isValidCron(value)
      }
      return true
    }).required('Preencha o agendamento com o padrão cron')
})

const dataSchema = Yup.object().shape({
  nome: Yup.string()
    .required('Preencha o nome do agendamento'),
  rotinaId: Yup.number()
    .required('Selecione uma rotina'),
  configuracao: Yup.string().required('Preencha a data de execução')
})

export { cronSchema, dataSchema }
