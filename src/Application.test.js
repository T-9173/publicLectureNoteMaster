import { render, screen } from '@testing-library/react';
import Application from './Application';

test('renders the heading of the Application page', () => {
  render(<Application />);
  const headingElement = screen.getByText(/Generate Notes from YouTube Video/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders the YouTube link input field', () => {
  render(<Application />);
  const inputElement = screen.getByLabelText(/YouTube Video Link/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders the note type selection', () => {
  render(<Application />);
  const noteTypeLabel = screen.getByText(/Select Note Type/i);
  expect(noteTypeLabel).toBeInTheDocument();
});
