import * as React from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

const tariffsReducer = (state, action) => {
  switch(action.type) {
    case 'TARIFFS_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'TARIFFS_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'TARIFFS_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
}

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
  
  const [subjectArea, setSubjectArea] = useStorageState('subjectArea', 'PO');
  
  const [tariffCode, setTariffCode] = useStorageState('tariffCode', '');

  const [description, setDescription] = useStorageState('description', '');
  
  const [url, setUrl] = React.useState(`${API_ENDPOINT}?fagomraade=${subjectArea}&gyldigdato=${validDate}&takstkode=%25${tariffCode}%25&beskrivelse=%25${description}%25`);

  const [tariffs, dispatchTariffs] = React.useReducer(
    tariffsReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleInputChange = (event) => {
    setValidDate(event.target.value);
  }

  const handleTodayClick = () => {
    setValidDate(new Date().toISOString().split("T")[0]);
  };

  const handleGetTariffs = React.useCallback(async () => {
    dispatchTariffs({ type: 'TARIFFS_FETCH_INIT' });

    try
    {
      let result = await axios.get(url);

      const sortedTariffs = result.data.takstkoder.sort((a, b) => {
        return a.takstkode.localeCompare(b.takstkode);
      });

      dispatchTariffs({
        type:'TARIFFS_FETCH_SUCCESS',
        payload: sortedTariffs,
      })
    } catch {
      dispatchTariffs({ type: 'TARIFFS_FETCH_FAILURE' })
    }
   
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

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  }

  const handleGetTariffsClick = (event) => {
    if(subjectArea === "ALLE")
    {
      setUrl(`${API_ENDPOINT}?gyldigdato=${validDate}&takstkode=%25${tariffCode}%25&beskrivelse=%25${description}%25`);
    } 
    else 
    {
      setUrl(`${API_ENDPOINT}?fagomraade=${subjectArea}&gyldigdato=${validDate}&takstkode=%25${tariffCode}%25&beskrivelse=%25${description}%25`);
    }

    event.preventDefault();
  };

  return (
    <>
      <h1>Takster hentet fra Helsedirektoratets API</h1>
      <h3>Dette nettstedet er utviklet av Asbjørn Engås. Dette er <em>IKKE</em> et offisielt nettsted for Helsedirektoratet, og det har ingen tilknytning til Helsedirektoratet.</h3>
    
        <div className="input-group">
         <SubjectAreaComboBox subjectArea={subjectArea} onSubjectAreaChange={handleSubjectAreaChange}/>
        </div>
    
      <div className="input-group">
        <InputWithLabel id="validDateInput" value={validDate} onInputChange={handleInputChange} placeholder="Filtrerer takstene til kun de som er gyldig på en gitt dato. Dato på formatet yyyy-MM-dd:">Gyldig dato: </InputWithLabel>
        <button className="small-button" onClick={handleTodayClick}>Dagens dato</button>
      </div>
      
      <div className="input-group">
        <InputWithLabel id="tariffCodeInput" value={tariffCode} onInputChange={handleTariffCodeChange} placeholder="Filtrer takstene til en gitt kode">Takstkode..: </InputWithLabel>
      </div>

      <div className="input-group">
        <InputWithLabel id="descriptionInput" value={description} onInputChange={handleDescriptionChange} placeholder="Filtrer på beskrivelsen til takstkoden">Beskrivelse: </InputWithLabel>
      </div>
 
      <p className="button-group">
        <button className="fetch-button" onClick={handleGetTariffsClick}>Hent takster</button>
      </p>

      {tariffs.isError && <p>Noe gikk galt under henting av takster...</p>}
      {tariffs.isLoading ? (
        <p>Henter takster...</p>
      ):(
        <TariffTable tariffs={tariffs.data} />
      )}
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

const InputWithLabel = ({id, value, type='text', onInputChange, placeholder, children}) => (
  <>
    <label htmlFor={id}>{children}</label>
    <input id={id} value={value} type={type} onChange={onInputChange} placeholder={placeholder}/>
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
          <th>Egenandel</th>
          <th>Pasient egenbetaling</th>
          <th>Beskrivelse</th>
          <th>Maks repetisjoner</th>
          <th>Repetisjonsprosent</th>
          <th>Redusert ref fra repetisjon</th>
          <th>Redusert repetisjonsprosent</th>
          <th>Spesialisttakst</th>
          <th>Ugyldig kombinasjon</th>
          <th>Krever takst</th>
          <th>Maks antall per år</th>
          <th>Maks antall per kalenderår</th>
          <th>Maks antall gjelder pasient</th>
          <th>Minimum tidsbruk</th>
          <th>Tidsbruk per rep</th>
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
    <td>{item.egenandel}</td>
    <td>{item.pasient_egenbetaling}</td>
    <td>{item.beskrivelse}</td>
    <td>{item.maks_repetisjoner}</td>
    <td>{item.repetisjonsprosent}</td>
    <td>{item.redusert_ref_fra_repetisjon}</td>
    <td>{item.redusert_repetisjonsprosent}</td>
    <td>{item.spesialisttakst}</td>
    <td>{item.ugyldig_kombinasjon}</td>
    <td>{item.krever_takst}</td>
    <td>{item.maks_antall_per_aar}</td>
    <td>{item.maks_antall_per_kalender_aar}</td>
    <td>{item.maks_antall_gjelder_pasient}</td>
    <td>{item.minimum_tidsbruk}</td>
    <td>{item.tidsbruk_per_rep}</td>
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
    <div><strong>Egenandel:</strong> {item.egenandel}</div>
    <div><strong>Pasient egenbetaling:</strong> {item.pasient_egenbetaling}</div>
    <div><strong>Beskrivelse:</strong> {item.beskrivelse}</div>
    <div><strong>Maks repetisjoner:</strong> {item.maks_repetisjoner}</div>
    <div><strong>Repetisjonsprosent:</strong> {item.repetisjonsprosent}</div>
    <div><strong>Redusert ref fra repetisjon:</strong> {item.redusert_ref_fra_repetisjon}</div>
    <div><strong>Redusert repetisjonsprosent</strong> {item.redusert_repetisjonsprosent}</div>
    <div><strong>Spesialisttakst: </strong> {item.spesialisttakst}</div>
    <div><strong>Ugyldig kombinasjon:</strong> {item.ugyldig_kombinasjon}</div>
    <div><strong>Krever takst: </strong> {item.krever_takst}</div>
    <div><strong>Maks antall per år: </strong> {item.maks_antall_per_aar}</div>
    <div><strong>Maks antall per kalenderår: </strong> {item.maks_antall_per_kalender_aar}</div>
    <div><strong>Maks antall gjelder pasient: </strong> {item.maks_antall_gjelder_pasient}</div>
    <div><strong>Minimum tidsbruk: </strong> {item.minimum_tidsbruk}</div>
    <div><strong>Tidsbruk per rep:</strong> {item.tidsbruk_per_rep}</div>
  </div>
);

export default App;
