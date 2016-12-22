using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class GroupPhaseVm : Viewmodel<GroupPhase>
    {
        public GroupType_Type Type
        {
            get { return model.Type.Value; }
            set
            {
                if (model.Type.Value != value)
                {
                    model.Type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int StartTimepoint_
        {
            get { return model.Timespan.StartTimepoint; }
            set
            {
                if (model.Timespan.StartTimepoint != value)
                {
                    model.Timespan.StartTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("Start_");
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return model.Timespan.EndTimepoint; }
            set
            {
                if (model.Timespan.EndTimepoint != value)
                {
                    model.Timespan.EndTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("End_");
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart
        {
            get { return model.Timespan.StartIsCustom(); }
        }

        public bool CustomEnd
        {
            get { return model.Timespan.EndIsCustom(); }
        }

        public DateTime Start
        {
            get { return model.Timespan.Start.Value; }
            set
            {
                if (model.Timespan.Start.Value != value)
                {
                    model.Timespan.Start.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End
        {
            get { return model.Timespan.End.Value; }
            set
            {
                if (model.Timespan.End.Value != value)
                {
                    model.Timespan.End.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region FilteredTimepoints
        protected ObservableCollection<TimepointVm> filteredTimepoints;

        public ObservableCollection<TimepointVm> FilteredTimepoints
        {
            get
            {
                if (filteredTimepoints == null)
                {
                    filteredTimepoints = new ObservableCollection<TimepointVm>();
                }

                Data data = MainViewModel.ActiveData;
                if (data != null && (data.Timepoints.Count + 1) != filteredTimepoints.Count)
                {
                    UpdateFilteredTimepoints();
                }
                return filteredTimepoints;
            }
        }

        protected virtual void UpdateFilteredTimepoints()
        {
            filteredTimepoints.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<TimepointVm> timepoints = vm.Timepoints;
            if (timepoints == null)
            {
                return;
            }

            foreach (TimepointVm t in timepoints)
            {
                filteredTimepoints.Add(t);
            }

            //Sort by date, youngest timepoint first
            int newIdx;
            for (int i = 1; i < filteredTimepoints.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (filteredTimepoints[i].Date.Year <= filteredTimepoints[newIdx].Date.Year)
                {
                    continue;
                }
                while (newIdx > 0 && filteredTimepoints[i].Date.Year > filteredTimepoints[newIdx - 1].Date.Year)
                {
                    newIdx--;
                }
                filteredTimepoints.Move(i, newIdx);
            }

            //Insert reset item
            filteredTimepoints.Insert(0, TimepointVm.INVALID);
        }
        #endregion

        public GroupPhaseVm() : base()
        {

        }

        public GroupPhaseVm(GroupPhase groupPhase) : base(groupPhase)
        {

        }
    }

    public class GroupVm : Viewmodel<Group>
    {
        protected GroupPhaseVm mainPhase;
        protected ObservableCollection<GroupPhaseVm> additionalPhases;

        public int ID
        {
            get { return model.ID; }
        }

        public GroupType_Type Type
        {
            get { return model.Type.Value; }
            set
            {
                if (model.Type.Value != value)
                {
                    model.Type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Name
        {
            get { return model.Name.Value; }
            set
            {
                if (model.Name.Value != value)
                {
                    model.Name.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region MainPhaseVm
        public int StartTimepoint
        {
            get { return mainPhase.StartTimepoint_; }
            set
            {
                if (mainPhase.StartTimepoint_ != value)
                {
                    mainPhase.StartTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("Start_");
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint
        {
            get { return mainPhase.EndTimepoint_; }
            set
            {
                if (mainPhase.EndTimepoint_ != value)
                {
                    mainPhase.EndTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("End_");
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart
        {
            get { return mainPhase.CustomStart; }
        }

        public bool CustomEnd
        {
            get { return mainPhase.CustomEnd; }
        }

        public DateTime Start
        {
            get { return mainPhase.Start; }
            set
            {
                if (mainPhase.Start != value)
                {
                    mainPhase.Start = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End
        {
            get { return mainPhase.End; }
            set
            {
                if (mainPhase.End != value)
                {
                    mainPhase.End = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public string Comment
        {
            get { return model.Comment.Value; }
            set
            {
                if (model.Comment.Value != value)
                {
                    model.Comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<GroupPhaseVm> AdditionalPhases
        {
            get { return additionalPhases; }
            set
            {
                if (additionalPhases != value)
                {
                    additionalPhases = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region FilteredTimepoints
        public ObservableCollection<TimepointVm> FilteredTimepoints
        {
            get { return mainPhase.FilteredTimepoints; }
        }
        #endregion

        public GroupVm() : base()
        {

        }

        public GroupVm(ref Group group) : base(group)
        {
            
        }

        protected override void AfterSetModel()
        {
            base.AfterSetModel();

            GroupPhase mainPhase = model.MainPhase;
            this.mainPhase = new GroupPhaseVm(mainPhase);

            additionalPhases = new ObservableCollection<GroupPhaseVm>();
            for (int i = 0; i < model.AdditionalPhases.Count; i++)
            {
                GroupPhase phase = model.AdditionalPhases[i];
                GroupPhaseVm phaseVm = new GroupPhaseVm(phase);
                additionalPhases.Add(phaseVm);
            }
        }

        protected static new Group CreateModelInternal()
        {
            return new Group(true);
        }
    }
}
