import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ZipFilePicker } from './ZipFilePicker';

function Harness() {
  const [file, setFile] = useState<File | null>(null);
  return <ZipFilePicker file={file} disabled={false} onChange={setFile} />;
}

describe('ZipFilePicker', () => {
  it('prompts for a file, then shows the chosen file name and size', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.getByText('Choose a ZIP file')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText('ZIP file'),
      new File(['x'.repeat(2048)], 'locations.zip', { type: 'application/zip' }),
    );

    expect(screen.getByText('locations.zip')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB · ready to upload')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });
});
