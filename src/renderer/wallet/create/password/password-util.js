import React from 'react';
import zxcvbn from 'zxcvbn';
import { Paragraph } from 'selfkey-ui';

export const handlePassword = (event, state) => {
	const strength = {
		0: 'Worst',
		1: 'Bad',
		2: 'Weak',
		3: 'Good',
		4: 'Strong'
	};
	const newPassword = event.target.value;
	const score = zxcvbn(newPassword).score;

	const normalizedScore = ((score - 0) * 100) / (4 - 0);
	const strengthToRender = strength[score];

	return {
		...state,
		password: newPassword,
		passwordScore: normalizedScore,
		strength: strengthToRender,
		error: ''
	};
};

export const renderPasswordStrength = (password, strength) => {
	if (password !== '') {
		return <Paragraph align="center">{strength}</Paragraph>;
	}
};
