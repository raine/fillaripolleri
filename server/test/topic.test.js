import { readFileSync } from 'fs'
import { parsePrice, processTopic } from '../lib/topic'

const readFile = (file) => readFileSync(file, 'utf8')
const readTestHtml = (id) => readFile(`${__dirname}/data/${id}.html`)

describe('price', () => {
  test('parsePrice', () => {
    const pairs = [
      ['Hp:480 €', 480],
      ['Hintapyyntö: 20 euroa', 20],
      ['Hintapyyntö: 20 eur', 20],
      ['Hintapyyntö: 20€', 20],
      ['Hintapyyntö: 20', 20],
      ['Hinta: 20 €', 20],
      ['Hinta: 20 e', 20],
      ['Hp: 20 €', 20],
      ['x20€', 20],
      [' 20e', 20],
      ['20e', 20],
      ['.20e', null],
      ['e20e', null],
      ['7,-', 7],
      [' 200 euroa', 200]
    ]

    pairs.forEach(([str, expected]) => {
      expect(parsePrice(str)).toEqual(expected, 'foo')
    })
  })

  test('hintapyyntö', () => {
    const input = {
      guid: 134148,
      date: '2018-09-03T21:05:31.000+03:00',
      category: 'Täysjousitetut 80-125mm',
      snapshots: [
        {
          id: 124237,
          guid: 134148,
          link: 'https://www.fillaritori.com/topic/134148-m-canyon-lux-cf-99-race-team-xl-16/',
          message: readTestHtml(124237),
          subject: 'Canyon Lux CF 9.9 Race team XL -16'
        }
      ]
    }

    expect(processTopic(input)).toEqual({
      id: 134148,
      category: 'Täysjousitetut 80-125mm',
      link:
        'https://www.fillaritori.com/topic/134148-m-canyon-lux-cf-99-race-team-xl-16/',
      timestamp: '2018-09-03T21:05:31.000+03:00',
      sold: false,
      title: 'Canyon Lux CF 9.9 Race team XL -16',
      price: 2900
    })
  })

  test('hp', () => {
    const input = {
      guid: 134116,
      date: '2018-09-03T18:32:01.000+03:00',
      category: 'Muut',
      snapshots: [
        {
          id: 124176,
          guid: 134116,
          link: 'https://www.fillaritori.com/topic/134116-tacx-flux-treineri/',
          message: readTestHtml(124176),
          subject: 'Tacx flux treineri',
          createdAt: '2018-09-03T18:40:10.781+03:00'
        }
      ]
    }

    expect(processTopic(input)).toEqual({
      category: 'Muut',
      id: 134116,
      link: 'https://www.fillaritori.com/topic/134116-tacx-flux-treineri/',
      price: 480,
      sold: false,
      timestamp: '2018-09-03T18:32:01.000+03:00',
      title: 'Tacx flux treineri'
    })
  })

  test('euroa', () => {
    const input = {
      guid: 134132,
      date: '2018-09-03T19:54:58.000+03:00',
      category: 'Lasten',
      snapshots: [
        {
          id: 124207,
          guid: 134132,
          link: 'https://www.fillaritori.com/topic/134132-dawes-blowfish-py%C3%B6r%C3%A4-16-helsinki-uusimaa/',
          message: readTestHtml(124207),
          subject: 'Dawes Blowfish pyörä 16", Helsinki Uusimaa',
          createdAt: '2018-09-03T20:00:31.276+03:00'
        }
      ]
    }

    expect(processTopic(input)).toEqual({
      category: 'Lasten',
      id: 134132,
      link: 'https://www.fillaritori.com/topic/134132-dawes-blowfish-py%C3%B6r%C3%A4-16-helsinki-uusimaa/',
      price: 110,
      sold: false,
      timestamp: '2018-09-03T19:54:58.000+03:00',
      title: 'Dawes Blowfish pyörä 16", Helsinki Uusimaa'
    })
  })
})
