import { getChartData } from './data'
// import data from './data.json'
import { chart } from './chart'
import './styles/styles.scss'

const tgChart = chart(document.getElementById('chart'), getChartData())
tgChart.init()
