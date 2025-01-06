import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the heading of the Home page', () => {
  render(<App />);
  const headingElement = screen.getByText(/Welcome to Lecture Note-Master!/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders the instructions for the app', () => {
  render(<App />);
  const instructions = screen.getByText(/Simplify note-taking for online lectures/i);
  expect(instructions).toBeInTheDocument();
});
