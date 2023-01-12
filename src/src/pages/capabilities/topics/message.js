import React, { useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall } from '@dfds-ui/react-components'
import styles from "./message.module.css";

// import { TextareaField } from '@dfds-ui/forms';

export default function Message({id, messageType, messageContract, description, isSelected, onClick}) {
    const clickHandler = () => {
        if (onClick) {
            onClick(id);
        }
    }

    return <AccordionSmall heading={messageType} isOpen={isSelected} onToggle={clickHandler}>
        <p>{description}</p>
        <div className={styles.columns}>
            <div className={styles.column}>
                {/* <TextareaField 
                    name="unlimited-textarea" 
                    label="Contract" 
                    placeholder="Hint" 
                    defaultValue={messageContract}
                    multiple={true}
                    size="small"
                    className={styles.contract}
                    height={100}
                /> */}

                <pre>
                    <code>
                        {/* {messageContract} */}
                    </code>
                </pre>
            </div>
            <div className={styles.column}>
                <pre>
                    <code>
                        {messageContract}
                    </code>
                </pre>
            </div>
        </div>
    </AccordionSmall>
}