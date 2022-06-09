

//Components
import Tabs from 'components/ui/Tabs';
import { useState } from 'react';




export default function ColonyWindow() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return <Tabs selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}>
        <Tabs.Tab label="Hello" className="wysiwyg">
            <p>The first tab</p>
            <p>The second line of the first tab</p>
        </Tabs.Tab>
        <Tabs.Tab label="World" className="wysiwyg">
            <p>TODO content for this tab.</p>
            <p>Some more text</p>
        </Tabs.Tab>
        <Tabs.Tab label="Foo Bar" className="wysiwyg">
            <p>A different tab with different content</p>
            <p>Yet another paragraph</p>
            <p>And one final line for good measure</p>
        </Tabs.Tab>
    </Tabs>
}