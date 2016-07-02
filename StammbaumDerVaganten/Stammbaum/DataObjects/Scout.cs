using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{

    [DataContract]
    public class Scout : DataObject, INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public String _FN
        {
            get { return forename; }
            set { forename = value; }
        }
        [DataMember]
        public String _LN
        {
            get { return lastname; }
            set { lastname = value; }
        }
        [DataMember]
        public String _SN
        {
            get { return scoutname; }
            set { scoutname = value; }
        }
        [DataMember]
        public Date _BD
        {
            get { return birthdate; }
            set { birthdate = value; }
        }
        [DataMember]
        public String _CI
        {
            get { return contactInfo; }
            set { contactInfo = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        [DataMember]
        public ObservableCollection<Membership> _M
        {
            get { return memberships; }
            set { memberships = value; }
        }
        [DataMember]
        public ObservableCollection<Activity> _A
        {
            get { return activities; }
            set { activities = value; }
        }
        #endregion

        protected String forename = new String();
        protected String lastname = new String();
        protected String scoutname = new String();

        protected Date birthdate = new Date();

        protected String contactInfo = new String();
        protected String comment = new String();

        protected ObservableCollection<Membership> memberships = new ObservableCollection<Membership>();
        protected ObservableCollection<Activity> activities = new ObservableCollection<Activity>();

        #region Accessors
        public string Forename
        {
            get { return forename.Value; }
            set
            {
                if (forename.Value != value)
                {
                    forename.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Lastname
        {
            get { return lastname.Value; }
            set
            {
                if (lastname.Value != value)
                {
                    lastname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Scoutname
        {
            get { return scoutname.Value; }
            set
            {
                if (scoutname.Value != value)
                {
                    scoutname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public Date Birthdate
        {
            get { return birthdate; }
            set
            {
                if (birthdate != value)
                {
                    birthdate = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region Birthdate_
        public DateTime Birthdate_
        {
            get { return birthdate.Value; }
            set
            {
                if (birthdate.Value != value)
                {
                    birthdate.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public bool Birthdate_YearDefined
        {
            get { return birthdate.YearDefined; }
            set
            {
                if (birthdate.YearDefined != value)
                {
                    birthdate.YearDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }

        public bool Birthdate_MonthDefined
        {
            get { return birthdate.MonthDefined; }
            set
            {
                if (birthdate.MonthDefined != value)
                {
                    birthdate.MonthDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }

        public bool Birthdate_DayDefined
        {
            get { return birthdate.DayDefined; }
            set
            {
                if (birthdate.DayDefined != value)
                {
                    birthdate.DayDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }
        #endregion

        public string ContactInfo
        {
            get { return contactInfo.Value; }
            set
            {
                if (contactInfo.Value != value)
                {
                    contactInfo.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return comment.Value; }
            set
            {
                if (comment.Value != value)
                {
                    comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<Membership> Memberships
        {
            get { return memberships; }
            set
            {
                if (memberships != value)
                {
                    memberships = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<Activity> Activities
        {
            get { return activities; }
            set
            {
                if (activities != value)
                {
                    activities = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Scout() : base()
        {

        }

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    return a;
                }
            }
            return null;
        }

        public ObservableCollection<Membership> GetMembershipsInGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public ObservableCollection<Activity> GetActivitiesInGroup(Group group)
        {
            ObservableCollection<Activity> result = new ObservableCollection<Activity>();
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

    }
}
