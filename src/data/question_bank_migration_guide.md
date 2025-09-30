# Question Bank Migration Guide: answerFormula → answerExpression

## Overview
This guide explains how to migrate your question bank from the old `answerFormula` system to the new `answerExpression` system using math.js.

## Required Changes

### 1. Field Name Change
**Old:** `"answerFormula": "..."`  
**New:** `"answerExpression": "..."`

### 2. Function Name Updates

| Old Function | New math.js Equivalent | Example |
|-------------|----------------------|---------|
| `simplifyFraction(a, b)` | `format(fraction(a, b))` | `format(fraction(3, 4))` |
| `simplifyRadical(n)` | `format(simplify('sqrt(' + n + ')'))` | `format(simplify('sqrt(8)'))` |
| `calculateDistance(x1,y1,x2,y2)` | `sqrt((x2-x1)^2 + (y2-y1)^2)` | `sqrt((x2-x1)^2 + (y2-y1)^2)` |
| `Math.pow(a, b)` | `a^b` | `x^2` instead of `Math.pow(x, 2)` |
| `Math.sqrt(n)` | `sqrt(n)` | `sqrt(16)` |
| `Math.abs(n)` | `abs(n)` | `abs(-5)` |

### 3. Expression Syntax Changes

#### Before (answerFormula):
```json
{
  "answerFormula": "Math.pow(a, 2) + Math.pow(b, 2)"
}
```

#### After (answerExpression):
```json
{
  "answerExpression": "a^2 + b^2"
}
```

### 4. Complex Expression Examples

#### Quadratic Formula:
```json
// Old
"answerFormula": "(-b + Math.sqrt(Math.pow(b, 2) - 4*a*c)) / (2*a)"

// New
"answerExpression": "(-b + sqrt(b^2 - 4*a*c)) / (2*a)"
```

#### Distance Formula:
```json
// Old
"answerFormula": "calculateDistance(x1, y1, x2, y2)"

// New
"answerExpression": "sqrt((x2-x1)^2 + (y2-y1)^2)"
```

#### Fraction Simplification:
```json
// Old
"answerFormula": "simplifyFraction(numerator, denominator)"

// New
"answerExpression": "format(fraction(numerator, denominator))"
```

### 5. Advanced math.js Features You Can Now Use

#### Symbolic Math:
```json
"answerExpression": "simplify('x^2 + 2*x + 1')"  // Returns "(x + 1)^2"
```

#### Unit Conversions:
```json
"answerExpression": "5 meter to cm"  // Returns "500 cm"
```

#### Matrix Operations:
```json
"answerExpression": "[[1, 2], [3, 4]] * [[5, 6], [7, 8]]"
```

## Migration Checklist

- [ ] Replace all `"answerFormula"` with `"answerExpression"`
- [ ] Update `Math.pow(a, b)` to `a^b`
- [ ] Update `Math.sqrt(n)` to `sqrt(n)`
- [ ] Update `Math.abs(n)` to `abs(n)`
- [ ] Replace custom functions with math.js equivalents
- [ ] Test all expressions with sample variables
- [ ] Verify LaTeX formatting still works correctly

## Backward Compatibility
The system will still work with old `answerFormula` fields but will show deprecation warnings. Plan to migrate all questions to `answerExpression` for future compatibility.

## Testing Your Migration
After updating your question bank, test each question type to ensure:
1. Variables generate correctly
2. Expressions evaluate properly
3. Answers format correctly (fractions, radicals, etc.)
4. LaTeX rendering works as expected