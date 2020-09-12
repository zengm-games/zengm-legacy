import React from 'react';
import {PHASE} from '../../common';
import {NewWindowLink} from '../components';
import {setTitle, toWorker} from '../util';

class FantasyDraft extends React.Component {

   constructor(props) {
        super(props);
		
        this.startDraft = this.startDraft.bind(this);
        this.handlePositionChange = this.handlePositionChange.bind(this);		
		
        this.state = {
            position: 'random',
            starting: false,
        };
    }    


    startDraft() {
        this.setState({starting: true});
        toWorker('startFantasyDraft', this.state.position);
    }

    handlePositionChange(event) {
        const position = event.target.value === 'random' ? 'random' : parseInt(event.target.value, 10);
        this.setState({position});
    }
	
	
    render() {
        setTitle('Fantasy Draft');

		
        return <div>
           <div className="form-group">
                <label htmlFor="position">What position do you want in the draft?</label>
					
					<select name="position" className="form-control" style={{width: '110px'}} onChange={this.handlePositionChange} value={this.state.position}>
                    <option value="random">Random</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                    <option value="24">24</option>
                    <option value="25">25</option>
                    <option value="26">26</option>
                    <option value="27">27</option>
                    <option value="28">28</option>
                    <option value="29">29</option>
                    <option value="30">30</option>
                    <option value="31">31</option>					
                    <option value="32">32</option>
                    <option value="33">33</option>
                    <option value="34">34</option>
                    <option value="35">35</option>
                    <option value="36">36</option>
                    <option value="37">37</option>
                    <option value="38">38</option>
                    <option value="39">39</option>
                    <option value="40">40</option>
                    <option value="41">41</option>					
                    <option value="42">42</option>
                    <option value="43">43</option>
                    <option value="44">44</option>
                    <option value="45">45</option>
                    <option value="46">46</option>
                    <option value="47">47</option>
                    <option value="48">48</option>
                    <option value="49">49</option>
                    <option value="50">50</option>					
                    <option value="51">51</option>					
                    <option value="52">52</option>
                    <option value="53">53</option>
                    <option value="54">54</option>
                    <option value="55">55</option>
                    <option value="56">56</option>
                    <option value="57">57</option>
                    <option value="58">58</option>
                    <option value="59">59</option>
                    <option value="60">60</option>								
                    <option value="61">61</option>					
                    <option value="62">62</option>
                    <option value="63">63</option>
                    <option value="64">64</option>
                    <option value="65">65</option>
                    <option value="66">66</option>
                    <option value="67">67</option>
                    <option value="68">68</option>
                    <option value="69">69</option>
                    <option value="70">70</option>							
                    <option value="71">71</option>						
                    <option value="72">72</option>						
                    <option value="73">73</option>						
                    <option value="74">74</option>						
                    <option value="75">75</option>						
                    <option value="76">76</option>						
                    <option value="77">77</option>						
                    <option value="78">78</option>						
                    <option value="79">79</option>						
                    <option value="80">80</option>						
                    <option value="81">81</option>						
					</select>
			</div>       
	   
           <p>
                <button
                    className="btn btn-large btn-success"
                    disabled={this.state.starting}
                    onClick={this.startDraft}
                >Start Fantasy Draft</button>
            </p>	   
            <span className="text-danger"><b>Warning:</b> Once you start a fantasy draft, there is no going back!</span>	   
        </div>;					


          
    }
}

FantasyDraft.propTypes = {
    phase: React.PropTypes.number.isRequired,
};

export default FantasyDraft;
