function generateVariableValue(constraints) {
    if (Array.isArray(constraints.textValue)) {
        // Pick a random element from the textValue array
        const randomIndex = Math.floor(Math.random() * constraints.textValue.length);
        return constraints.textValue[randomIndex];
    }
    // Existing validation logic
    // ...
}