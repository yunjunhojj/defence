import { Layout } from './components/Layout';
import { CodeEditor } from './components/CodeEditor';
import { SandboxPreview } from './components/SandboxPreview';
import { AnswerSheetModal } from './components/AnswerSheetModal';

function App() {
  return (
    <Layout>
      <div className="flex-1 flex flex-row w-full h-full">
        <CodeEditor />
        <SandboxPreview />
      </div>
      <AnswerSheetModal />
    </Layout>
  );
}

export default App;
