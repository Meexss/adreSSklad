import { useState } from "react";

const PrintLabel = () => {
    const [currentStep, setCurrentStep] = useState(0)

    return (
        <Layout>
            <div>
                <div>
                    <input type="checkbox " name="Квадрат в квадрате"/>
                    <input type="checkbox " name="Муссорка"/>
                    <input type="checkbox " name="Кран с водой"/>
                    <input type="checkbox " name="CE"/>
                    <input type="checkbox " name="EAC"/>
                    <input type="checkbox " name="Звезда в круге"/>
                </div>
                <div>
                    <input type="text" name="Наименование товара"/>
                    <input type="text" name="Артикул товара"/>
                    <input type="text" name="Старна производства"/>
                    <input type="text" name="номер год производства"/>
                    <input type="text" name="Строчка 1 "/>
                    <input type="text" name="Строчка 2 "/>
                    <input type="text" name="Строчка 3 "/>
                    <input type="text" name="Штрихкод товара"/>
                    <input type="number" name="Количество этикеток"/>
                </div>
                <button>Этикетки на товар</button>
                <button>Этикетки на коробку</button>
            </div>
            <div>
                {currentStep === 1 &&
                // Общий контейнер этикеток 
                <div>
                    {/* Верхний блок  */}
                    <div>
                        {/* Левый хедер  */}
                        <div>
                            <div>верхняя часть иконки</div>
                        </div>
                        {/* Правый хедер  */}
                        <div>
                            <div>правая часть иконка Керхер + Страна производства + артикул</div>
                        </div>
                    </div>
                    {/* Центральный блок   */}
                    <div>
                        <div>
                            {/* Верх цетра слева серийник справа код производства  */}
                            <div></div>
                            {/* Строчка 1 */}
                            <div></div>
                            {/* Строчка 2 */}
                            <div></div>
                            {/* Строчка 3 */}
                            <div></div>
                        </div>
                    </div>
                    {/* Нижний блок  */}
                    <div>
                        {/* Штрихкод  */}
                        <div></div>
                        {/* Название бренда  */}
                        <div></div>
                    </div>
                </div>  
                }
                {currentStep === 2 &&
                <div>код для этикеток на коробоку</div>  
                }
            </div>

        </Layout>
    );
};

export default PrintLabel;
