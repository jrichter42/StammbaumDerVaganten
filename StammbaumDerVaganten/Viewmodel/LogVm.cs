using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class LogVm : Viewmodel<Log>
    {
        protected ObservableCollection<string> history;

        public ObservableCollection<string> History
        {
            get { return history; }
            /*set
            {
                if (history != value)
                {
                    history = value;
                    NotifyPropertyChanged();
                }
            }*/
        }

        public string HistoryTop
        {
            get
            {
                if (model.HistoryTop == "")
                {
                    return "Ready when you are.";
                }
                return model.HistoryTop;
            }
        }

        public LogVm()
        { }

        public LogVm(Log log)
            : base(log)
        { }

        protected override void AfterSetModel()
        {
            base.AfterSetModel();
            
            history = new ObservableCollection<string>(model.History);
            model.EntryAdded += HandleLogEntryAdded;
        }


        private void HandleLogEntryAdded(string author, string entry)
        {
            if (history is null)
            {
                return;
            }

            history.Add(entry);
        }
    }
}
