import * as React from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  },[value, key]);

  return [value, setValue];
};

const API_ENDPOINT = 'https://api.helsedirektoratet.no/helserefusjon/v1/takstkoder';

function App() {

  const [validDate, setValidDate] = useStorageState('validDate', new Date().toISOString().split("T")[0]);

  const [tariffs, setTariffs] = React.useState([]);

  const [subjectArea, setSubjectArea] = useStorageState('subjectArea', 'PO');
  
  const [tariffCode, setTariffCode] = useStorageState('tariffCode', '');
  
  const [url, setUrl] = React.useState(`${API_ENDPOINT}?fagomraade=${subjectArea}&gyldigdato=${validDate}&takstkode=${tariffCode}`);

  const handleInputChange = (event) => {
    setValidDate(event.target.value);
  }

  const handleTodayClick = () => {
    setValidDate(new Date().toISOString().split("T")[0]);
  };

  const handleGetTariffs = React.useCallback(async () => {
    let result = await axios.get(url);

    const sortedTariffs = result.data.takstkoder.sort((a, b) => {
      return a.takstkode.localeCompare(b.takstkode);
    });
    
    setTariffs(sortedTariffs);
  }, [url]);

  React.useEffect(() => {
    handleGetTariffs()
  }, [handleGetTariffs]);

  const handleSubjectAreaChange = (event) => {
    setSubjectArea(event.target.value);
  }

  const handleTariffCodeChange = (event) => {
    setTariffCode(event.target.value);
  }

  const handleGetTariffsClick = (event) => {
    if(subjectArea === "ALLE")
    {
      setUrl(`${API_ENDPOINT}?gyldigdato=${validDate}&takstkode=${tariffCode}`);
    } 
    else 
    {
      setUrl(`${API_ENDPOINT}?fagomraade=${subjectArea}&gyldigdato=${validDate}&takstkode=${tariffCode}`);
    }

    event.preventDefault();
  };

  return (
    <>
      <h1>Takster hentet fra Helsedirektoratets API</h1>
      <h3>Dette nettstedet er utviklet av Asbjørn Engås. Dette er <em>IKKE</em> et offisielt nettsted for Helsedirektoratet, og det har ingen tilknytning til Helsedirektoratet.</h3>
      <p>
        <SubjectAreaComboBox subjectArea={subjectArea} onSubjectAreaChange={handleSubjectAreaChange}/>
      </p>
      <div className="input-group">
        <InputWithLabel id="validDateInput" value={validDate} onInputChange={handleInputChange}>Gyldig dato: </InputWithLabel>
        <button className="small-button" onClick={handleTodayClick}>Dagens dato</button>
      </div>
      <label><em> Filtrerer takstene til kun de som er gyldig på en gitt dato. Dato på formatet yyyy-MM-dd:</em></label>
      <p>
        <InputWithLabel id="tariffCodeInput" value={tariffCode} onInputChange={handleTariffCodeChange}>Takstkode: </InputWithLabel>
        <label><em> Filtrer takstene til en gitt kode, kan kombineres med de andre parametrene eller brukes alene.</em></label>
      </p>
      <p className="button-group">
        <button className="fetch-button" onClick={handleGetTariffsClick}>Hent takster</button>
      </p>
      <TariffTable tariffs={tariffs} />
    </>
  )
}

const SubjectAreaComboBox = ({
  subjectArea,
  onSubjectAreaChange
}) => (
  <>
    <label htmlFor="subjectAreaSelect">Fagområde: </label>
    <select id="subjectAreaSelect" value={subjectArea} onChange={onSubjectAreaChange}>
      <option value="ALLE">Alle</option>
      <option value="AP">Audiopedagog</option>
      <option value="BE">Behandlingsreiser i utlandet</option>
      <option value="FBV">Fritt behandlingsvalg</option>
      <option value="FY">Fysioterapi</option>
      <option value="HS">Helsestasjon</option>
      <option value="JO">Jordmor</option>
      <option value="KI">Kiropraktor</option>
      <option value="LE">Lege</option>
      <option value="LOGO">Logoped</option>
      <option value="LR">Private lab/radiologi</option>
      <option value="OR">Ortoptist</option>
      <option value="PO">Poliklinikk</option>
      <option value="PS">Psykolog</option>
      <option value="PT">Primærhelseteam</option>
      <option value="RE">Rehabiliteringsinstitusjon</option>
      <option value="TH">Tannhelse</option>
      <option value="TP">Tannpleier</option>
    </select>
  </>
)

const InputWithLabel = ({id, value, type='text', onInputChange, children}) => (
  <>
    <label htmlFor={id}>{children}</label>
    <input id={id} value={value} type={type} onChange={onInputChange}/>
  </>
);

const TariffTable = ({
  tariffs
}) => (
  <div className="tariff-container">
    <table className="tariff-table">
      <thead>
        <tr>
          <th>Takstkode</th>
          <th>Fagområde</th>
          <th>Fra dato</th>
          <th>Til dato</th>
          <th>Honorar</th>
          <th>Refusjon</th>
          <th>Pasient egenbetaling</th>
          <th>Repetisjonsprosent</th>
          <th>Ugyldig kombinasjon</th>
          <th>Tidsbruk per rep</th>
          <th>Beskrivelse</th>
        </tr>
      </thead>
      <tbody>
        {tariffs.map((item) => (
          <TariffItem 
           key={item.takst_id} 
           item={item} />
        ))}
      </tbody>
    </table>
    <div className="tariff-cards">
      {tariffs.map((item) => (
        <TariffCard key={item.takst_id} item={item} />
      ))}
    </div>
  </div>
);

const TariffItem = ( {item }) => (
  <tr>
    <td>{item.takstkode}</td>
    <td>{item.fagomraade}</td>
    <td>{item.fradato}</td>
    <td>{item.tildato}</td>
    <td>{item.honorar}</td>
    <td>{item.refusjon}</td>
    <td>{item.pasient_egenbetaling}</td>
    <td>{item.repetisjonsprosent}</td>
    <td>{item.ugyldig_kombinasjon}</td>
    <td>{item.tidsbruk_per_rep}</td>
    <td>{item.beskrivelse}</td>
  </tr>
);

const TariffCard = ({ item }) => (
  <div className="tariff-card">
    <div><strong>Takstkode:</strong> {item.takstkode}</div>
    <div><strong>Fagområde:</strong> {item.fagomraade}</div>
    <div><strong>Fra dato:</strong> {item.fradato}</div>
    <div><strong>Til dato:</strong> {item.tildato}</div>
    <div><strong>Honorar:</strong> {item.honorar}</div>
    <div><strong>Refusjon:</strong> {item.refusjon}</div>
    <div><strong>Pasient egenbetaling:</strong> {item.pasient_egenbetaling}</div>
    <div><strong>Repetisjonsprosent:</strong> {item.repetisjonsprosent}</div>
    <div><strong>Ugyldig kombinasjon:</strong> {item.ugyldig_kombinasjon}</div>
    <div><strong>Tidsbruk per rep:</strong> {item.tidsbruk_per_rep}</div>
    <div><strong>Beskrivelse:</strong> {item.beskrivelse}</div>
  </div>
);

export default App;
