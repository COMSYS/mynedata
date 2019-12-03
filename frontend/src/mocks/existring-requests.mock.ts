import {DataTypes} from '../config/data-types.config';
import {RequestStateEnum, UserConsentStateEnum} from '../config/requests.config';
import {RequestInternalRepresentationModel} from '../models/internal-representation/request.internal-representation.model';

export const ExistingRequestsMock: RequestInternalRepresentationModel[] = [
  {
    processorId: 0,
    requestId: 0,
    title: 'Smart Home Empfehlungen',
    targetedData: [
      {
        datatype: DataTypes.PERSONAL,
        detailed: 'Geburtsjahr, Geschlecht, Postleitzahl, Anzahl Personen im Haushalt'
      },
      {
        datatype: DataTypes.SMART_HOME,
        detailed: 'Baujahr, Heizschaltzeiten, Temperaturen innen, Temperaturen außen'
      }
    ],
    requestState: RequestStateEnum.PENDING,
    goalDescription: 'Auswertung zur Produktverbesserung',
    reward: 'Individualisierte Empfehlungen zur Energieeinsparung und Komfort-verbesserung mit graphischer Aufbereitung der Daten',
    description: 'Your Home möchte Hausautomation voranbringen und den Nutzern eine intuitive und bedarfsgerechte Steuerung Ihrer 4-Wände ermöglichen. Dafür möchten wir bisherige Produkte optimieren und Nutzer verstehen lernen.\n' +
      'Wenn Sie uns Ihre Smart Home Daten zur Verfügung stellen, analysieren wir diese danach, wie Sie Energie sparen und gleichzeitig Ihren Komfort erhöhen können. Sie erhalten von uns informative und intuitiv aufbereitete Übersichten über Ihren Energieverbrauch und Tipps für ein effizienteres und komfortableres Leben in Ihren 4-Wänden.',
    intervalTime: {
      start: 1546300800000,
      end: 1554076799000
    },
    consentTime: {
      start: 1546300820000,
      end: 1554076799000
    },
    granularity: 120000,
    amount: 1,
    maxPrivacy: 2,
    consentState: UserConsentStateEnum.IS_PENDING
  },
  {
    processorId: 1,
    requestId: 1,
    title: 'Mobilitätsverhalten',
    targetedData: [
      {
        datatype: DataTypes.PERSONAL,
        detailed: 'Geburtsjahr, Geschlecht, Postleitzahl, Beruf'
      },
      {
        datatype: DataTypes.LOCATION,
        detailed: 'Standortdaten Smartphone, Nutzung von Verkehrsmitteln'
      }
    ],
    requestState: RequestStateEnum.PENDING,
    goalDescription: 'Wissenschaftliche Studie zum Mobilitätsverhalten verschiedener Alters- und Berufsgruppen',
    reward: 100,
    description: 'In dem interdisziplinären Forschungsprojekt "Mobility" untersuchen wir, wie die Mobilität von morgen aussehen soll, um den Bedürfnissen aller Nutzer gerecht zu werden. Dafür möchten wir das Mobilitätsverhalten verschiedenster Nutzergruppen – also sowohl von älteren als auch jüngeren, Auto- und Busnutzern, Studenten und Berufstätigkeiten untersuchen.',
    intervalTime: {
      start: 1546297200000,
      end: 1554076799000
    },
    consentTime: {
      start: 1546300820000,
      end: 1554076799000
    },
    granularity: 120000,
    amount: 1,
    maxPrivacy: 2,
    consentState: UserConsentStateEnum.IS_PENDING
  },
  {
    processorId: 2,
    requestId: 2,
    title: 'Werbewirkung',
    targetedData: [
      {
        datatype: DataTypes.PERSONAL,
        detailed: 'Geburtsjahr, Geschlecht, Postleitzahl, Anzahl Personen im Haushalt'
      },
      {
        datatype: DataTypes.CONSUMER,
        detailed: 'Hobbies, Markenvorlieben, online gekaufte Produkte, bevorzugte Zahlweise'
      },
      {
        datatype: DataTypes.ONLINE_ACTIVITY,
        detailed: 'Browserverlauf auf allen mobile und stationären Geräten'
      }
    ],
    requestState: RequestStateEnum.PENDING,
    goalDescription: 'Analyse der Werbewirkung',
    reward: 300,
    description: 'Dialego ist ein Marktforschungsinstitut aus Aachen und Pionier des digitalen Wandels. Wir möchten die Wirkung von Internetwerbung auf Sie als Konsumenten erforschen. \n' +
      'Wir bieten Ihnen 300 Punkte, die Sie frei eintauschen können, wenn Sie uns einen Monat lang Zugriff auf Ihren Browserverlauf auf Ihrem PC, Tablet und Smartphone gewähren. Wir analysieren, welche Webseiten Sie sich ansehen und welche Werbung darauf geschaltet wird, wie lange Sie sich auf Webseiten aufhalten und welche Produkte Sie interessieren und kaufen. Natürlich bleiben Ihre Daten anonym – es werden keine Rückschlüsse auf Ihre Person gezogen.',
    intervalTime: {
      start: 1546300800000,
      end: 1554076799000
    },
    consentTime: {
      start: 1546300820000,
      end: 1554076799000
    },
    granularity: 120000,
    amount: 1,
    maxPrivacy: 2,
    consentState: UserConsentStateEnum.IS_PENDING
  },
  {
    processorId: 3,
    requestId: 3,
    title: 'Klinische Studie',
    targetedData: [
      {
        datatype: DataTypes.PERSONAL,
        detailed: 'Geburtsjahr, Geschlecht, Beruf, Familienstand, Körpergröße'
      },
      {
        datatype: DataTypes.MEDICAL,
        detailed: 'Tägliche Schritte, Sportliche Aktivitäten, Schlafdauer, Trink- und Essverhalten, Krankheitsdiagnosen, Gewicht, Medikation'
      }
    ],
    requestState: RequestStateEnum.PENDING,
    goalDescription: 'Klinische Studie zur Erforschung des Zusammenhangs von Bewegung, Ernährung, Krankheiten und Gewicht',
    reward: 'Gesundheitscheck zu Beginn und nach Ende der Studie individualisierte Empfehlungen für einen gesünderen Lebensstil',
    description: 'Für eine international angelegte, klinische Studie suchen wir Teilnehmer, welche einen Aktivitäts-/Fitnesstracker nutzen. Wir erforschen den Zusammenhang von Bewegung, Ernährung und Gewicht. Dafür benötigen wir Zugriff auf die Daten Ihres Aktivitätstrackers über Bewegung, Schlaf und Ernährung. Für die Dauer der Studie müssen Sie Essen und Trinken vollständig tracken. \n' +
      'Dafür erhalten Sie von uns einen Gesundheitscheck zu Beginn und Ende Studie sowie individualisierte Empfehlungen für einen gesunden Lebensstil nach Ende der Studie. Nehmen Sie über myneData an der Studie teil, ist Ihre Privatsphäre geschützt. Alle Daten, die über myneData geteilt werden, können nicht auf Sie zurückgeführt werden.',
    intervalTime: {
      start: 1575154800000,
      end: 1656626399000
    },
    consentTime: {
      start: 1546300820000,
      end: 1554076799000
    },
    granularity: 120000,
    amount: 1,
    maxPrivacy: 2,
    consentState: UserConsentStateEnum.IS_PENDING
  }
];
