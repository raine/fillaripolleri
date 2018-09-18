import { readFileSync } from 'fs'
import { parsePrice, processTopic, removePrice, cleanUpSubject, parseLocation } from '../lib/topic'

const readFile = (file) => readFileSync(file, 'utf8')
const readTestHtml = (id) => readFile(`${__dirname}/data/${id}.html`)

// babel loses the fn.name of exported functions
// hence separate fnName
const runTestList = (fnName, fn, tests) =>
  describe(fnName, () => {
    tests.forEach(([x, expected]) => {
      test(`${x} -> ${expected}`, () => {
        expect(fn(x)).toEqual(expected)
      })
    })
  })

describe('price', () => {
  const tests = [
    ['Hp:480 €', 480],
    ['Hintapyyntö: 20 euroa', 20],
    ['Hintapyyntö: 20 eur', 20],
    ['Hintapyyntö: 20€', 20],
    ['Hintapyyntö: 4 000 €', 4000],
    ['Hintapyyntö: 20', 20],
    // ['Hintapyyntö: 1.200€', 1200],
    ['Hinta: 20 €', 20],
    ['Hinta: 20 e', 20],
    ['Hp: 20 €', 20],
    ['HP: 370', 370],
    ['x20€', 20],
    ['20 €', 20],
    [' 20e', 20],
    ['20e', 20],
    ['.20e', null],
    ['e20e', null],
    ['7,-', 7],
    [' 200 euroa', 200],
    [' 200 Euros', 200]
  ]

  runTestList('parsePrice()', parsePrice, tests)

  test('hintapyyntö', () => {
    const input = {
      guid: 134148,
      date: '2018-09-03T21:05:31.000+03:00',
      category: 'Täysjousitetut 80-125mm',
      categoryId: 1,
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
      categoryId: 1,
      link: 'https://www.fillaritori.com/topic/134148-m-canyon-lux-cf-99-race-team-xl-16/',
      location: 'Kauhajoki',
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
      location: 'Hämeenlinna',
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
      location: 'Helsinki',
      price: 110,
      sold: false,
      timestamp: '2018-09-03T19:54:58.000+03:00',
      title: 'Dawes Blowfish pyörä 16", Uusimaa'
    })
  })
})

describe('remove price from title', () => {
  const tests = [
    ['foo 20 e', 'foo '],
    ['foo 20 €', 'foo '],
    ['foo 20€', 'foo '],
    ['foo hinta 20 euroa', 'foo  '],
    ['foo 20 euroa', 'foo ']
  ]

  runTestList('parsePrice()', removePrice, tests)

  test('remove 25€ from title', () => {
    const input = {
      guid: 131395,
      date: '2018-08-06T21:23:45.000+03:00',
      category: 'Kengät',
      snapshots: [
        {
          id: 35611,
          guid: 131395,
          link: 'https://www.fillaritori.com/topic/131395-myyty-shimano-r106-maantiekeng%C3%A4tklossit-44-25%E2%82%AC/',
          message: readTestHtml(35611),
          subject: 'Shimano R106 maantiekengät+klossit (44) 25€',
          createdAt: '2018-08-17T13:15:00.296+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      title: 'Shimano R106 maantiekengät+klossit (44)'
    })
  })
})

const tests = [
  ['MYYTY - lol', 'lol'],
  ['MYYTY - MYYTY - lol', 'lol'],
  ['M: foo', 'foo'],
  ['M: foo (100€)', 'foo'],
  ['M: foo    ', 'foo'],
  ['M: foo Helsinki', 'foo'],
  ['M: foo helsinki', 'foo'],
  ['M: foo  bar', 'foo bar'],
  ['28" Shining A-M1 622x19 etukiekko', '28" Shining A-M1 622x19 etukiekko'],
  ['M: White 2½FatPro *Helsinki*', 'White 2½FatPro'],
  ['M: White 2½FatPro Helsinkin', 'White 2½FatPro Helsinkin'],
  ['Trek tyttöjen pyörä [Helsinki]', 'Trek tyttöjen pyörä'],
  ['Felt F65x (55cm, 2017, Helsinki)', 'Felt F65x (55cm, 2017)']
]

runTestList('cleanSubject()', cleanUpSubject('Helsinki'), tests)

describe('location parsing', () => {
	const tests = [
		['hello Helsinki', 'Helsinki'],
		['hello HELSINKI', 'Helsinki'],
		['Paikkakunta (lisää myös otsikkoon): Kempele', 'Kempele'],
		['Paikkakunta\u00a0(lisää myös otsikkoon): Kempele', 'Kempele'],
		['Paikkakunta: maybecity yes', 'Maybecity'],
		['Paikkakunta:Jyväskylä', 'Jyväskylä'],
		['Paikkakunta: Kittilä', 'Kittilä'],
		['Paikkakunta : Pietarsaari', 'Pietarsaari']
	]

	runTestList('parseLocation()', parseLocation, tests)

  test('Paikkakunta: espoo, not in title', () => {
    const input = {
      guid: 134339,
      date: '2018-09-05T21:55:51.000+03:00',
      category: 'Satulat ja tolpat',
      snapshots: [
        {
          id: 124590,
          guid: 134339,
          link: 'https://www.fillaritori.com/topic/134339-ism-pr-10-satula/',
          message: readTestHtml(124590),
          subject: 'ISM PR 1.0 satula',
          createdAt: '2018-09-05T23:34:33.747+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      location: 'Espoo'
    })
  })

  test('Paikkakunta: espoo and in title', () => {
    const input = {
      guid: 134339,
      date: '2018-09-05T21:55:51.000+03:00',
      category: 'Satulat ja tolpat',
      snapshots: [
        {
          id: 124590,
          guid: 134339,
          link: 'https://www.fillaritori.com/topic/134339-ism-pr-10-satula/',
          message: readTestHtml(124590),
          subject: 'ISM PR 1.0 satula Espoo',
          createdAt: '2018-09-05T23:34:33.747+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      location: 'Espoo',
      title: 'ISM PR 1.0 satula',
    })
  })

  test('Tampere in title, no paikkakunta in body', () => {
    const input = {
      guid: 134279,
      date: '2018-09-05T09:40:33.000+03:00',
      category: 'Etujousitetut',
      snapshots: [
        {
          id: 124548,
          guid: 134279,
          link: 'https://www.fillaritori.com/topic/134279-2017-cube-acid-29-19-tampere/',
          message: readTestHtml(124548),
          subject: '2017 Cube Acid 29" 19" Tampere',
          createdAt: '2018-09-05T09:40:36.716+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      location: 'Tampere',
      title: '2017 Cube Acid 29" 19"'
    })
  })

  test('HKI in subject, Paikkakunta: Helsinki', () => {
    const input = {
      guid: 134266,
      date: '2018-09-04T22:12:54.000+03:00',
      category: 'Kiekot',
      snapshots: [
        {
          id: 124523,
          guid: 134266,
          link: 'https://www.fillaritori.com/topic/134266-uudenveroiset-',
          message: readTestHtml(124523),
          subject: 'Uudenveroiset maantiekiekot HKI',
          createdAt: '2018-09-04T22:20:17.142+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      location: 'Helsinki',
      title: 'Uudenveroiset maantiekiekot'
    })
  })

  test('Lpr in subject, Paikkakunta: Lpr', () => {
    const input = {
      guid: 134280,
      date: '2018-09-05T09:40:43.000+03:00',
      category: 'Rungot',
      snapshots: [
        {
          id: 124551,
          guid: 134280,
          link: 'https://www.fillaritori.com/topic/134280-santa-cruz-5010-cc-275-koko-m-lpr/',
          message: readTestHtml(124551),
          subject: 'Santa Cruz 5010 CC 27,5" koko M Lpr',
          createdAt: '2018-09-05T09:50:21.141+03:00'
        }
      ]
    }

    expect(processTopic(input)).toMatchObject({
      location: 'Lappeenranta',
      title: 'Santa Cruz 5010 CC 27,5" koko M',
    })
  })

  // test pietarsaari
  // https://www.fillaritori.com/topic/133135-myyty-rapha-core-softshelltakki-l/
})
