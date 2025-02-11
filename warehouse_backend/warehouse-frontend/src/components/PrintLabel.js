import { useState, useEffect } from "react";
import Layout from './Layout';
import "./Label.css"
import squre from './img/squre.png'
import CE from './img/CE.png'
import EAC from './img/EAC.png'
import karcher_mini from './img/karcher-mini.png'
import karcher_big from './img/karcher-big.png'
import trush from './img/Trush.png'
import ukr from './img/Ukr.png'
import water from './img/water.png'
import Barcode from "react-barcode";


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
            Math.floor(230000 + Math.random() *300000)
        );
        setSerialNumbers(newSerials);

    }

    

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
                {serialNumbers.length > 0 && <button onClick={handleLabel}>Этикетки на товар</button>}
                {serialNumbers.length > 0 && <button onClick={handleLabelPartTwo}>Этикетки на коробку</button>}
            </div>
            <div className="allWrap">
                {currentStep === 1 && (
                // Общий контейнер этикеток 

                serialNumbers.map((sn, index) => (
                            <div className="mainWrapLabel" key={index}>
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
                                            <p className="textLogo">{formData["Страна производства"]}</p>
                                            
                                        </div>
                                    </div>
                                    <div className="wrapText">
                                        <p>{formData["Наименование товара"]}</p>
                                        <p>{formData["Артикул товара"]}</p>
                                    </div>
                                </div>
                                {/* Центральный блок   */}
                                <div>
                                    <div className="wrapBlockText">
                                        {/* Верх цетра слева серийник справа код производства  */}
                                        <div className="wrapSN">      
                                            <div>S/N:  {sn}</div>
                                            <div>{formData["номер год производства"]}</div>
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
                                        width={2}         // Уменьшаем ширину штрих-кода
                                        height={30}       // Уменьшаем высоту штрих-кода
                                        // displayValue={false}
                                        textMargin={0}
                                        fontSize={13}
                                        margin={0}
                                        marginTop={0}
                                    />
                                    {/* Название бренда  */}
                                    <p className="textBottom">Alfred Kärcher SE & Co. KG, P.O.Box 160, 71349 Winnenden, Germany</p>
                                </div>
                            </div> 
                )))
                }
                {currentStep === 2 &&
                <div>
                    {/* верхний блок  */}
                    <div>
                        <div>
                            <p>TYPE</p>
                            <p></p>
                        </div>
                        <div>
                            <p>PART-NO</p>
                            <p></p>
                        </div>
                        <div>
                            <p>SERIAL-NO</p>
                            <p></p>
                        </div>
                        <div>
                            <img/>
                            <img/>
                        </div>


                    </div>
                    {/* Нижний блок  */}
                    <div>
                        <div>
                            <p>MANUFACTURERS USE ONLY</p>
                            <div>Генерируем баркод</div>
                            <p></p>
                        </div>
                        <div>
                            <p></p>
                        </div>
                        <div>
                            <p>GTIN</p>
                            <div>Баркод товара</div>
                        </div>

                    </div>


                </div>  
                }
            </div>

        </Layout>
    );
};

export default PrintLabel;
