import { useState, useEffect,  useRef} from "react";
import Layout from './Layout';
import "./Label.css"
import squre from './img/5.png'
import CE from './img/2.png'
import EAC from './img/1.png'
import karcher_mini from './img/7.png'
import karcher_big from './img/9.png'
import WAR from './img/8.png'
import WARwhite from './img/001.png'
import EACwhite from './img/EAC.png'
import ukrwhite from './img/Ukr.png'
import trush from './img/3.png'
import ukr from './img/6.png'
import water from './img/4.png'
import Barcode from "react-barcode";
import bootom from './img/bottom.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowLeft, faPrint, faRotate } from '@fortawesome/free-solid-svg-icons';
// import Barcode from "react-barcode";
import { useReactToPrint } from 'react-to-print';



const PrintLabel = () => {
    const [currentStep, setCurrentStep] = useState(0)
    const [serialNumbers, setSerialNumbers] = useState([]);

    const [checkedIcons, setCheckedIcons] = useState({
        "Квадрат в квадрате": false,
        "Муссорка": false,
        "Кран с водой": false,
        "CE": false,
        "EAC": false,
        "Звезда в круге": false
    });

    const [formData, setFormData] = useState({
        "Наименование товара": "",
        "Артикул товара": "",
        "Страна производства": "",
        "номер год производства": "",
        "Напряжение": "",
        "Строчка 2": "",
        "Строчка 3": "",
        "Штрихкод товара": "",
        "Количество этикеток": ""
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedIcons((prev) => ({ ...prev, [name]: checked }));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const icons = [
        { name: "Квадрат в квадрате", src: squre },
        { name: "Муссорка", src: trush },
        { name: "Кран с водой", src: water },
        { name: "CE", src: CE },
        { name: "EAC", src: EAC },
        { name: "Звезда в круге", src: ukr }
    ];

    const handleLabel = () => {
        setCurrentStep(1)
    }

    const handleLabelPartTwo = () => {
        setCurrentStep(2)
    }


    const generator = () => {
        const labelsCount = Number(formData["Количество этикеток"]);
        const newSerials = Array.from({ length: labelsCount }, () => 
            Math.floor(230000 + Math.random() * (300000 - 230000 + 1))
        );
        setSerialNumbers(newSerials);
    };

       // Печать
         const contentRef = useRef();
        // Печать
            const handlePrint = useReactToPrint({
                // documentTitle: 'Title',
                contentRef: contentRef,
             })
    

    return (
        <Layout>
            <div className="wrap-label-main">
                <div>
                {Object.keys(checkedIcons).map((key) => (
                        <label className="labelErap" key={key}>
                            <input
                                type="checkbox"
                                name={key}
                                checked={checkedIcons[key]}
                                onChange={handleCheckboxChange}
                            />
                            {key}
                        </label>
                    ))}
                </div>
                <div>
                {Object.keys(formData).map((key) => (
                        <input
                            key={key}
                            type={key === "Количество этикеток" ? "number" : "text"}
                            name={key}
                            placeholder={key}
                            value={formData[key]}
                            onChange={handleInputChange}
                        />
                    ))}

                </div>
                <button onClick={generator}>Сгенерировать </button>
                <button className='no-print btn-ship' onClick={handlePrint} style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '14px' }}>
                                <FontAwesomeIcon icon={faPrint} /> Печать
                                </button>
                {serialNumbers.length > 0 && <button onClick={handleLabel}>Этикетки на товар</button>}
                {serialNumbers.length > 0 && <button onClick={handleLabelPartTwo}>Этикетки на коробку</button>}
            </div>
            
            <div className="allWrap" ref={contentRef} >
                
                {currentStep === 1 && (
                // Общий контейнер этикеток 

                serialNumbers.map((sn, index) => (
                            <div   className="mainWrapLabel" key={index}>
                                {/* Верхний блок  */}
                                <div>
                                    <div className="wramTOP">
                                        {/* Левый хедер  */}
                                        <div>
                                            {/* Отображение только выбранных иконок */}
                                            {icons.map(({ name, src }) =>
                                                checkedIcons[name] ? <img className="imgIcon" key={name} src={src} alt={name} /> : null
                                            )}
                                            
                                        </div>
                                        {/* Правый хедер  */}
                                        <div className="wrapLogo">
                                            <img className="imgIconKar" src={karcher_big}/>
                                            <div className="textLogo">{formData["Страна производства"]}</div>
                                            
                                        </div>
                                    </div>
                                    <div className="wrapText">
                                        <p className="mainTextBody">{formData["Наименование товара"]}</p>
                                        <p className="mainTextBody">{formData["Артикул товара"]}</p>
                                    </div>
                                </div>
                                {/* Центральный блок   */}
                                <div>
                                    <div className="wrapBlockText">
                                        {/* Верх цетра слева серийник справа код производства  */}
                                        <div className="wrapSN">      
                                            <div className="textSN">S/N:  {sn}</div>
                                            <div className="textYear">{formData["номер год производства"]}</div>
                                        </div>
                                        <div className="textAbout">{formData["Напряжение"]}</div>
                                        <div className="textAbout">{formData["Строчка 2"]}</div>
                                        <div className="textAbout">{formData["Строчка 3"]}</div>
                                    </div>
                                </div>
                                {/* Нижний блок  */}
                                <div className="wrapBottom">
                                    {/* Штрихкод  */}
                                    <Barcode
                                        className="barcodeData"
                                        value={formData["Штрихкод товара"]}
                                        format="CODE128"
                                        width={1.8}         // Уменьшаем ширину штрих-кода
                                        height={30}       // Уменьшаем высоту штрих-кода
                                        // displayValue={false}
                                        textMargin={0}
                                        fontSize={11}
                                        margin={0}
                                        marginTop={0}
                                        marginBottom={1}
                                        background={'#666666'}
                                    />
                                    {/* Название бренда  */}
                                    <p className="textBottom">Alfred Kärcher SE & Co. KG, P.O.Box 160, 71349 Winnenden, Germany</p>
                                </div>
                            </div> 
                )))
                }
                {currentStep === 2 &&

                serialNumbers.map((sn, index) => (
                <div className="mainWrapLabelTwo" key={index}>
                    {/* верхний блок  */}
                    <div className="WrapLabelTwo">

                        <div>
                            <p className="textManu">MANUFACTURERS USE ONLY</p>
                            <Barcode
                                        className="barcodeData"
                                        value={"9014470500406207"}
                                        format="CODE128"
                                        width={1.8}         // Уменьшаем ширину штрих-кода
                                        height={60}       // Уменьшаем высоту штрих-кода
                                        textMargin={0}
                                        fontSize={13}
                                        margin={0}
                                        marginTop={0}
                                    />
                        </div>
                        <div className="mainBodyTextTwo">
                            <p className="mainTextBodyTWO">{formData["Наименование товара"]}</p>
                            <p className="mainTextBodyTWO">{formData["Артикул товара"]}{" Serial  "}{sn}</p>
                            <p className="mainTextBodyTWO">{formData["Напряжение"]}</p>
                            <p className="mainTextCountryTWO">{formData["Страна производства"]}</p>        
                        </div>
                        <div className="bottomBlock">
                            <p className="gtinText">GTIN</p>
                            <div className="labelBottom">
                            <img className="imgIconTwo" src={WARwhite} alt={WARwhite} />
                            <img className="imgIconTwo" src={EACwhite} alt={EACwhite} />
                            <img className="imgIconTwo" src={ukrwhite} alt={ukrwhite} />
                            </div>
                        </div>
                        <div>
                        <Barcode
                                        className="EAN13"
                                        value={formData["Штрихкод товара"]}
                                        format="EAN13"
                                        width={1.4}         // Уменьшаем ширину штрих-кода
                                        height={85}       // Уменьшаем высоту штрих-кода
                                        textMargin={0}
                                        fontSize={15}
                                        margin={0}
                                        marginTop={0}
                                    />
                        </div>


                    </div >
                        
                    <div>
                    <img className="imgBottom" src={bootom} alt={bootom}/>

                    
                       </div>  

                </div>  
                ))}
            </div>

        </Layout>
    );
};

export default PrintLabel;
