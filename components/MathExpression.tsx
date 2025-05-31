import { FC } from "react";
import { InlineMath, BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';

interface MathExpressionProps {
  latex: string;
  isBlock?: boolean;
  className?: string;
}

const MathExpression: FC<MathExpressionProps> = ({ latex, isBlock = false, className }) => {
  const cleanLatex = latex.replace(/^\$\$|^\$|\$\$$|\$$/g, '').trim();
  const Component = isBlock ? BlockMath : InlineMath;

  return (
    <span className={className} aria-label={`Mathematical expression: ${cleanLatex}`}>
      <Component math={cleanLatex} errorColor="#cc0000" />
    </span>
  );
};

export default MathExpression;