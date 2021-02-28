// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getTheme} from '@mm-redux/selectors/entities/preferences';

import Verification from './verification.js';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Verification);
