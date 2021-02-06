import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Home } from '../components/Home'

configure({ adapter: new Adapter() });

describe('<Home />', () => {
    test('testing component rendering', () => {
        const wrapper = shallow(<Home />, { disableLifecycleMethods : true });

        expect(wrapper.find('canvas')).toHaveLength(4);
    });
});